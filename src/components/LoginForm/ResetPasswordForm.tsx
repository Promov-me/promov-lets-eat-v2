
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { resetPasswordSchema, ResetPasswordFormValues } from "./schema";
import { resetPassword } from "./LoginService";

const ResetPasswordForm = () => {
  const [isResetting, setIsResetting] = useState(false);

  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      documento: "",
      email: "",
    },
  });

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    setIsResetting(true);
    try {
      const success = await resetPassword(values);
      if (success) {
        resetForm.reset();
      }
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
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
  );
};

export default ResetPasswordForm;
