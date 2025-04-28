
import { supabase } from "@/integrations/supabase/client";
import { generateUniqueRandomNumbers } from "@/lib/utils/generateNumbers";

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { documento, quantidade } = await req.json();

    // Validar entrada
    if (!documento || !quantidade || quantidade < 1) {
      return new Response('Dados inválidos', { status: 400 });
    }

    // Buscar configuração atual
    const { data: config, error: configError } = await supabase
      .from('configuracao_campanha')
      .select('series_numericas')
      .single();

    if (configError) throw configError;

    const maxNumber = config.series_numericas * 100000;

    // Buscar números existentes
    const { data: existingNumbers, error: numbersError } = await supabase
      .from('numeros_sorte')
      .select('numero');

    if (numbersError) throw numbersError;

    const existingSet = new Set(existingNumbers?.map(n => n.numero));

    // Gerar novos números
    const novosNumeros = generateUniqueRandomNumbers(quantidade, maxNumber, existingSet);

    // Inserir números gerados
    const { error: insertError } = await supabase
      .from('numeros_sorte')
      .insert(novosNumeros.map(numero => ({
        numero,
        documento
      })));

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ 
      success: true, 
      numeros: novosNumeros 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro ao gerar números:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Erro ao gerar números' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
