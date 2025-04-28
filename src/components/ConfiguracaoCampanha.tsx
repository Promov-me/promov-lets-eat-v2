
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateUniqueRandomNumbers } from "@/lib/utils/generateNumbers";

const ConfiguracaoCampanha = () => {
  const { toast } = useToast();
  const [documento, setDocumento] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [seriesNumericas, setSeriesNumericas] = useState(1);

  const { data: configData, refetch: refetchConfig } = useQuery({
    queryKey: ["configuracao"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("configuracao_campanha")
        .select("*")
        .single();
      
      if (error) throw error;
      if (data) setSeriesNumericas(data.series_numericas);
      return data;
    }
  });

  const updateSeriesMutation = useMutation({
    mutationFn: async (series: number) => {
      const { error } = await supabase
        .from("configuracao_campanha")
        .update({ series_numericas: series })
        .eq("id", configData?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Configuração atualizada",
        description: "O número de séries foi atualizado com sucesso."
      });
      refetchConfig();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a configuração.",
        variant: "destructive"
      });
      console.error("Erro ao atualizar séries:", error);
    }
  });

  const gerarNumerosMutation = useMutation({
    mutationFn: async ({ documento, quantidade }: { documento: string; quantidade: string }) => {
      // Buscar configuração atual
      const { data: config, error: configError } = await supabase
        .from("configuracao_campanha")
        .select("series_numericas")
        .single();
      
      if (configError) throw configError;
      
      const maxNumber = config.series_numericas * 100000;
      
      // Buscar números existentes
      const { data: existingNumbers, error: numbersError } = await supabase
        .from("numeros_sorte")
        .select("numero");
      
      if (numbersError) throw numbersError;
      
      const existingSet = new Set(existingNumbers?.map(n => n.numero) || []);
      
      // Gerar novos números
      const novosNumeros = generateUniqueRandomNumbers(
        parseInt(quantidade), 
        maxNumber, 
        existingSet
      );
      
      // Inserir números gerados
      const { error: insertError } = await supabase
        .from("numeros_sorte")
        .insert(novosNumeros.map(numero => ({
          numero,
          documento
        })));
      
      if (insertError) throw insertError;
      
      // Verificar se o participante já existe e inseri-lo se não existir
      const { error: participanteError } = await supabase
        .from("participantes")
        .upsert({ documento }, { onConflict: 'documento' });
      
      if (participanteError) throw participanteError;
      
      return { numeros: novosNumeros };
    },
    onSuccess: (data) => {
      toast({
        title: "Números gerados com sucesso",
        description: `Foram gerados ${data.numeros.length} números para o documento ${documento}`
      });
      setDocumento("");
      setQuantidade("");
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao gerar números",
        variant: "destructive"
      });
      console.error("Erro ao gerar números:", error);
    }
  });

  const handleUpdateSeries = () => {
    updateSeriesMutation.mutate(seriesNumericas);
  };

  const handleGerarNumeros = (e: React.FormEvent) => {
    e.preventDefault();
    if (!documento || !quantidade) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para gerar números",
        variant: "destructive"
      });
      return;
    }
    gerarNumerosMutation.mutate({ documento, quantidade });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Configuração de Séries</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Número de Séries Numéricas</Label>
            <Input
              type="number"
              min="1"
              value={seriesNumericas}
              onChange={(e) => setSeriesNumericas(parseInt(e.target.value) || 1)}
            />
            <p className="text-sm text-gray-500">
              Intervalo atual: 0 a {(seriesNumericas * 100000) - 1}
            </p>
          </div>
          <Button 
            onClick={handleUpdateSeries}
            disabled={updateSeriesMutation.isPending}
          >
            {updateSeriesMutation.isPending ? "Atualizando..." : "Atualizar Configuração"}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Geração Manual de Números</h3>
        <form onSubmit={handleGerarNumeros} className="space-y-4">
          <div className="space-y-2">
            <Label>CPF/CNPJ</Label>
            <Input
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              placeholder="Digite o CPF ou CNPJ"
            />
          </div>
          <div className="space-y-2">
            <Label>Quantidade de Números</Label>
            <Input
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              placeholder="Digite a quantidade de números"
            />
          </div>
          <Button 
            type="submit"
            disabled={gerarNumerosMutation.isPending}
          >
            {gerarNumerosMutation.isPending ? "Gerando..." : "Gerar Números"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ConfiguracaoCampanha;
