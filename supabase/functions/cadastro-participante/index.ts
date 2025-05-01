
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.37.0";

// CORS Headers para requisições cross-origin
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Lidar com requisições OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Verificar se a requisição é POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: "Método não permitido" }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Analisar corpo da requisição
    const requestData = await req.json();
    const {
      nome,
      genero,
      email,
      telefone,
      documento,
      rua,
      numero,
      bairro,
      complemento,
      cep,
      cidade,
      uf,
      senha,
    } = requestData;

    // Validar campos obrigatórios
    const requiredFields = ['nome', 'documento', 'senha'];
    const missingFields = requiredFields.filter(field => !requestData[field]);
    
    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: "Campos obrigatórios ausentes", 
          missingFields 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Verificar se o documento já existe
    const { data: existingUser, error: checkError } = await supabase
      .from('participantes')
      .select('id')
      .eq('documento', documento)
      .maybeSingle();

    if (checkError) {
      console.error("Erro ao verificar documento:", checkError);
      throw new Error(`Erro na verificação do documento: ${checkError.message}`);
    }

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "Este documento já está cadastrado" }),
        {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Inserir novo participante
    const { data, error } = await supabase
      .from('participantes')
      .insert({
        nome,
        genero,
        email,
        telefone,
        documento,
        rua,
        numero,
        bairro,
        complemento: complemento || null,
        cep,
        cidade,
        uf,
        senha,
        // Garantir que data_cadastro seja preenchido automaticamente pelo banco
      })
      .select()
      .single();

    if (error) {
      console.error("Erro na inserção:", error);
      throw new Error(`Erro ao inserir participante: ${error.message}`);
    }

    // Retornar resposta de sucesso sem dados sensíveis
    const { senha: _, ...safeData } = data;

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Participante cadastrado com sucesso",
        data: safeData
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error("Erro no cadastro:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Falha ao processar o cadastro",
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
