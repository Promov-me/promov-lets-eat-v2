
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertCircle } from "lucide-react";
import { registerSchema, RegisterFormValues } from "./schema";
import PersonalInfoFields from "./PersonalInfoFields";
import AddressFields from "./AddressFields";
import SecurityFields from "./SecurityFields";
import { registerParticipant } from "./RegisterService";

const RegisterForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: "",
      genero: "",
      email: "",
      telefone: "",
      documento: "",
      rua: "",
      numero: "",
      bairro: "",
      complemento: "",
      cep: "",
      cidade: "",
      uf: "",
      senha: "",
      confirmarSenha: ""
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    const result = await registerParticipant(values);
    
    if (result.success) {
      // Resetar formulário
      form.reset();
    } else {
      setErrorMessage(result.error || null);
    }
    
    setIsLoading(false);
  };

  return (
    <Form {...form}>
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro no cadastro</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <PersonalInfoFields form={form} />
          <AddressFields form={form} />
          <SecurityFields form={form} />
        </div>

        <Alert className="mt-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Campos marcados com * são de preenchimento obrigatório
          </AlertDescription>
        </Alert>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Cadastrando..." : "Cadastrar"}
        </Button>
      </form>
    </Form>
  );
};

export default RegisterForm;
