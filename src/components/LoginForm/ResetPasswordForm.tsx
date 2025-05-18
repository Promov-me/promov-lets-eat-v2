
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { resetPasswordSchema, ResetPasswordFormValues } from "./schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { resetPassword } from "./LoginService";

interface ResetPasswordFormProps {
  onBackToLogin: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onBackToLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      documento: "",
      email: "",
    },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await resetPassword(values);
      if (result) {
        setIsSuccess(true);
        form.reset();
      }
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      setErrorMessage("Ocorreu um erro ao processar sua solicitação. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isSuccess ? (
        <div className="text-center space-y-4">
          <p className="text-green-600">
            Uma nova senha foi gerada. Verifique o toast para visualizá-la.
          </p>
          <Button onClick={onBackToLogin} variant="outline" className="w-full">
            Voltar para o Login
          </Button>
        </div>
      ) : (
        <>
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <p className="text-sm text-gray-500 mb-4">
            Informe seu CPF/CNPJ e email para redefinir sua senha.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="documento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF/CNPJ</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Digite seu CPF ou CNPJ" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Digite seu email" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={onBackToLogin} className="flex-1">
                  Voltar
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Enviando..." : "Redefinir Senha"}
                </Button>
              </div>
            </form>
          </Form>
        </>
      )}
    </div>
  );
};

export default ResetPasswordForm;
