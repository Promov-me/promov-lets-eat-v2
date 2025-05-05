
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { RegisterFormValues } from "./schema";

interface SecurityFieldsProps {
  form: UseFormReturn<RegisterFormValues>;
}

const SecurityFields: React.FC<SecurityFieldsProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="senha"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Senha*</FormLabel>
            <FormControl>
              <Input type="password" placeholder="Digite sua senha" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="confirmarSenha"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Confirme a senha*</FormLabel>
            <FormControl>
              <Input type="password" placeholder="Digite sua senha novamente" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default SecurityFields;
