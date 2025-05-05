
import { RegisterFormValues } from "./schema";
import { toast } from "@/hooks/use-toast";

// Constants
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvb3ZyeGZwanN5dnBrcWR4a29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MzgwOTQsImV4cCI6MjA2MTQxNDA5NH0.7x9xrScO6VZdmT2YlwoCXHKS7I1e0CIW58xDIgf0N1w";
const SUPABASE_URL = "https://uoovrxfpjsyvpkqdxkoa.supabase.co";

export const registerParticipant = async (values: RegisterFormValues): Promise<{ success: boolean, error?: string }> => {
  try {
    console.log("Enviando dados para cadastro:", { 
      ...values, 
      senha: "******" // Removendo senha por segurança nos logs
    });
    
    // Usar a função edge do Supabase para cadastro
    const response = await fetch(`${SUPABASE_URL}/functions/v1/cadastro-participante`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add the required authorization header
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        nome: values.nome,
        genero: values.genero,
        email: values.email,
        telefone: values.telefone,
        documento: values.documento,
        rua: values.rua,
        numero: values.numero,
        bairro: values.bairro,
        complemento: values.complemento || null,
        cep: values.cep,
        cidade: values.cidade,
        uf: values.uf,
        senha: values.senha,
      }),
    });

    const result = await response.json();
    console.log("Resposta do servidor:", result);
    
    if (!response.ok) {
      throw new Error(result.error || result.details || "Erro no cadastro");
    }

    toast({
      title: "Cadastro realizado com sucesso",
      description: "Você pode fazer login agora",
    });
    
    return { success: true };
    
  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    const errorMsg = error instanceof Error ? error.message : "Ocorreu um erro ao processar seu cadastro. Tente novamente.";
    
    toast({
      title: "Erro ao cadastrar",
      description: errorMsg,
      variant: "destructive",
    });
    
    return { 
      success: false,
      error: errorMsg
    };
  }
};
