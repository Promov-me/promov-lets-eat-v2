
import { z } from "zod";

export const loginSchema = z.object({
  documento: z.string().min(1, { message: "CPF/CNPJ é obrigatório" }),
  senha: z.string().min(1, { message: "Senha é obrigatória" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const resetPasswordSchema = z.object({
  documento: z.string().min(1, { message: "CPF/CNPJ é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }).min(1, { message: "Email é obrigatório" }),
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
