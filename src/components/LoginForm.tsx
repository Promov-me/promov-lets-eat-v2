
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

const loginSchema = z.object({
  documento: z.string().min(1, { message: "CPF/CNPJ é obrigatório" }),
  senha: z.string().min(1, { message: "Senha é obrigatória" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      documento: "",
      senha: "",
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

  return (
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
      </form>
    </Form>
  );
};

export default LoginForm;
