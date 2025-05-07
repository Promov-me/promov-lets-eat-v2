
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateUniqueRandomNumbers(quantity: number, maxNumber: number, existingNumbers: Set<number>): number[] {
  const numbers: number[] = [];
  
  while (numbers.length < quantity) {
    const randomNumber = Math.floor(Math.random() * maxNumber);
    if (!existingNumbers.has(randomNumber) && !numbers.includes(randomNumber)) {
      numbers.push(randomNumber);
    }
  }
  
  return numbers.sort((a, b) => a - b);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Criar cliente do Supabase usando informações da request
    const supabaseClient = createClient(
      // Usar o mesmo projeto Supabase
      'https://uoovrxfpjsyvpkqdxkoa.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvb3ZyeGZwanN5dnBrcWR4a29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MzgwOTQsImV4cCI6MjA2MTQxNDA5NH0.7x9xrScO6VZdmT2YlwoCXHKS7I1e0CIW58xDIgf0N1w',
      {
        global: {
          headers: {
            Authorization: req.headers.get('Authorization') || '',
          },
        },
      }
    )

    const { documento, quantidade } = await req.json()
    
    console.log("Recebida requisição para gerar números:", { documento, quantidade });

    if (!documento || !quantidade) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Documento e quantidade são obrigatórios' 
        }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Verificar se o participante já está cadastrado
    const { data: participantes, error: participanteError } = await supabaseClient
      .from('participantes')
      .select('documento')
      .eq('documento', documento)
      
    if (participanteError) throw participanteError
    
    console.log("Resultado da consulta de participante:", participantes);
    
    // Se o participante não estiver cadastrado, retornar erro
    if (!participantes || participantes.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Documento não encontrado'
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Buscar configuração atual
    const { data: configs, error: configError } = await supabaseClient
      .from('configuracao_campanha')
      .select('series_numericas')
    
    if (configError) throw configError
    
    console.log("Configuração da campanha:", configs);
    
    // Se não existir configuração, tenta criar uma configuração padrão
    const config = configs && configs.length > 0 ? configs[0] : { series_numericas: 1 };
    
    const maxNumber = config.series_numericas * 100000;
    console.log("Máximo número disponível:", maxNumber);

    // Buscar números existentes
    const { data: existingNumbers, error: numbersError } = await supabaseClient
      .from('numeros_sorte')
      .select('numero')
    
    if (numbersError) throw numbersError

    const existingSet = new Set(existingNumbers?.map(n => n.numero) || []);
    console.log("Total de números existentes:", existingSet.size);

    // Gerar novos números
    const novosNumeros = generateUniqueRandomNumbers(
      parseInt(quantidade.toString()), 
      maxNumber, 
      existingSet
    );
    
    console.log("Novos números gerados:", novosNumeros);

    // Inserir números gerados com a observação
    const { error: insertError } = await supabaseClient
      .from('numeros_sorte')
      .insert(novosNumeros.map(numero => ({
        numero,
        documento,
        obs: "Número gerado manualmente"
      })))
    
    if (insertError) {
      console.error("Erro ao inserir números:", insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        numeros: novosNumeros 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor'
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
