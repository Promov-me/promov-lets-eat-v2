
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
    const { documento, senha } = await req.json();

    // Validate required fields
    if (!documento || !senha) {
      return new Response(
        JSON.stringify({ 
          error: "Documento e senha são obrigatórios" 
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

    // Check for participant
    const { data: participante, error: participanteError } = await supabase
      .from('participantes')
      .select('id, documento, nome, email, senha')
      .eq('documento', documento)
      .maybeSingle();

    if (participanteError) throw participanteError;

    if (!participante) {
      return new Response(
        JSON.stringify({ error: "Documento não cadastrado" }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify password
    if (participante.senha !== senha) {
      return new Response(
        JSON.stringify({ error: "Senha incorreta" }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate token (in a real app, use a proper JWT)
    // This is a simple implementation. In production, use a more secure approach
    const token = crypto.randomUUID();
    
    // Return user data without sensitive fields
    const { senha: _, ...userData } = participante;

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Login realizado com sucesso",
        token,
        user: userData
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error("Erro no login:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Falha ao processar o login",
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
