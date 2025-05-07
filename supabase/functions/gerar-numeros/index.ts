
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
    const supabaseClient = createClient(
      'https://uoovrxfpjsyvpkqdxkoa.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvb3ZyeGZwanN5dnBrcWR4a29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MzgwOTQsImV4cCI6MjA2MTQxNDA5NH0.7x9xrScO6VZdmT2YlwoCXHKS7I1e0CIW58xDIgf0N1w'
    )

    const { documento, quantidade } = await req.json()

    if (!documento || !quantidade) {
      return new Response(
        JSON.stringify({ 
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

    // Buscar configuração atual (se não existir, cria uma configuração padrão)
    let { data: configs, error: configError } = await supabaseClient
      .from('configuracao_campanha')
      .select('series_numericas')
    
    if (configError) throw configError
    
    // Se não existir configuração ou múltiplas configurações, usar valor padrão
    const config = configs && configs.length > 0 ? configs[0] : { series_numericas: 1 };
    
    // Se não existir configuração, tenta criar uma configuração padrão
    if (!configs || configs.length === 0) {
      const { error: insertError } = await supabaseClient
        .from('configuracao_campanha')
        .insert({ series_numericas: 1 })
        
      if (insertError) {
        console.error('Erro ao criar configuração padrão:', insertError)
      }
    }

    const maxNumber = config.series_numericas * 100000

    // Buscar números existentes
    const { data: existingNumbers, error: numbersError } = await supabaseClient
      .from('numeros_sorte')
      .select('numero')
    
    if (numbersError) throw numbersError

    const existingSet = new Set(existingNumbers?.map(n => n.numero) || [])

    // Gerar novos números
    const novosNumeros = generateUniqueRandomNumbers(
      parseInt(quantidade), 
      maxNumber, 
      existingSet
    )

    // Inserir números gerados com a observação
    const { error: insertError } = await supabaseClient
      .from('numeros_sorte')
      .insert(novosNumeros.map(numero => ({
        numero,
        documento,
        obs: "Número gerado automaticamente"
      })))
    
    if (insertError) throw insertError

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
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
