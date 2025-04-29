
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const loginSchema = z.object({
  documento: z.string().min(1, { message: "CPF/CNPJ é obrigatório" }),
  senha: z.string().min(1, { message: "Senha é obrigatória" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const resetPasswordSchema = z.object({
  documento: z.string().min(1, { message: "CPF/CNPJ é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }).min(1, { message: "Email é obrigatório" }),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      documento: "",
      senha: "",
    },
  });

  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      documento: "",
      email: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      // Verificar se o participante existe no banco
      const { data: participante, error: participanteError } = await supabase
        .from("participantes")
        .select("id, documento, senha")
        .eq("documento", values.documento)
        .maybeSingle();

      if (participanteError) throw participanteError;

      if (!participante) {
        toast({
          title: "Erro ao fazer login",
          description: "Documento não cadastrado",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Verificar a senha
      if (participante.senha !== values.senha) {
        toast({
          title: "Erro ao fazer login",
          description: "Senha incorreta",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Salvar o ID do participante no localStorage
      localStorage.setItem("participanteId", participante.id);
      localStorage.setItem("participanteDocumento", participante.documento);
      
      toast({
        title: "Login realizado com sucesso",
        description: "Você será redirecionado para seus números da sorte",
      });

      // Redirecionar para a página de números
      navigate("/numeros");
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast({
        title: "Erro ao fazer login",
        description: "Ocorreu um erro ao processar seu login. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    setIsResetting(true);
    try {
      // Verificar se o participante existe com o documento e email informados
      const { data: participante, error: participanteError } = await supabase
        .from("participantes")
        .select("id, documento, email")
        .eq("documento", values.documento)
        .eq("email", values.email)
        .maybeSingle();

      if (participanteError) throw participanteError;

      if (!participante) {
        toast({
          title: "Dados não encontrados",
          description: "Não encontramos um participante com esse documento e email",
          variant: "destructive",
        });
        setIsResetting(false);
        return;
      }

      // Gerar uma nova senha aleatória
      const novaSenha = Math.random().toString(36).slice(-8);

      // Atualizar a senha no banco
      const { error: updateError } = await supabase
        .from("participantes")
        .update({ senha: novaSenha })
        .eq("id", participante.id);

      if (updateError) throw updateError;

      // Exibir a nova senha para o usuário (em produção, seria enviado por email)
      toast({
        title: "Senha redefinida com sucesso",
        description: `Sua nova senha é: ${novaSenha}`,
        duration: 10000,
      });
      
      resetForm.reset();
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      toast({
        title: "Erro ao redefinir senha",
        description: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="documento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF/CNPJ</FormLabel>
                <FormControl>
                  <Input placeholder="Digite seu CPF ou CNPJ" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="senha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Digite sua senha" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
          
          <div className="text-center mt-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" className="text-sm text-primary hover:text-primary/80" type="button">
                  Esqueci minha senha
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-center">Recuperação de Senha</DialogTitle>
                </DialogHeader>
                <Form {...resetForm}>
                  <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4 mt-4">
                    <FormField
                      control={resetForm.control}
                      name="documento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF/CNPJ</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite seu CPF ou CNPJ" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={resetForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Digite seu email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isResetting}>
                      {isResetting ? "Processando..." : "Recuperar Senha"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </form>
      </Form>
    </>
  );
};

export default LoginForm;
