
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

    // Buscar configuração atual (se não existir, cria uma configuração padrão)
    let { data: config, error: configError } = await supabaseClient
      .from('configuracao_campanha')
      .select('series_numericas')
      .maybeSingle()
    
    if (configError) throw configError
    
    // Se não existir configuração, usa valor padrão de 1 série numérica
    if (!config) {
      // Tenta criar uma configuração padrão
      const { error: insertError } = await supabaseClient
        .from('configuracao_campanha')
        .insert({ series_numericas: 1 })
        
      if (insertError) {
        console.error('Erro ao criar configuração padrão:', insertError)
      }
      
      config = { series_numericas: 1 }
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

    // Inserir números gerados
    const { error: insertError } = await supabaseClient
      .from('numeros_sorte')
      .insert(novosNumeros.map(numero => ({
        numero,
        documento
      })))
    
    if (insertError) throw insertError

    // Verificar se o participante já existe e inseri-lo se não existir
    const { error: participanteError } = await supabaseClient
      .from('participantes')
      .upsert({ documento }, { onConflict: 'documento' })
    
    if (participanteError) throw participanteError

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
