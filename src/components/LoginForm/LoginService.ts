
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LoginFormValues, ResetPasswordFormValues } from "./schema";

export const loginUser = async (values: LoginFormValues) => {
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
    return null;
  }

  // Verificar a senha
  if (participante.senha !== values.senha) {
    toast({
      title: "Erro ao fazer login",
      description: "Senha incorreta",
      variant: "destructive",
    });
    return null;
  }

  // Salvar o ID do participante no localStorage
  localStorage.setItem("participanteId", participante.id);
  localStorage.setItem("participanteDocumento", participante.documento);
  
  toast({
    title: "Login realizado com sucesso",
    description: "Você será redirecionado para seus números da sorte",
  });

  return participante;
};

export const resetPassword = async (values: ResetPasswordFormValues) => {
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
    return false;
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
  
  return true;
};
