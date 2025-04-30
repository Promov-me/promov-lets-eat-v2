
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.37.0";

// CORS Headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if request is POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: "Método não permitido" }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Parse request body
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

    // Validate required fields
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Check if document already exists
    const { data: existingUser } = await supabase
      .from('participantes')
      .select('id')
      .eq('documento', documento)
      .maybeSingle();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "Este documento já está cadastrado" }),
        {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Insert new participant
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
      })
      .select()
      .single();

    if (error) throw error;

    // Return success response without sensitive data
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
