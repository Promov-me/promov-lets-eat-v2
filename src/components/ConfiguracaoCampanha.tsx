
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateUniqueRandomNumbers } from "@/lib/utils/generateNumbers";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ConfiguracaoCampanha = () => {
  const { toast } = useToast();
  const [documento, setDocumento] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [seriesNumericas, setSeriesNumericas] = useState(1);
  const [configLoaded, setConfigLoaded] = useState(false);

  const { data: configData, isLoading: configLoading, error: configError, refetch: refetchConfig } = useQuery({
    queryKey: ["configuracao"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("configuracao_campanha")
          .select("*")
          .maybeSingle();
        
        if (error) throw error;
        
        // Se não existir configuração, criar uma
        if (!data) {
          const { data: newConfig, error: insertError } = await supabase
            .from("configuracao_campanha")
            .insert({ series_numericas: 1 })
            .select()
            .maybeSingle();
          
          if (insertError) throw insertError;
          
          if (newConfig) {
            setSeriesNumericas(newConfig.series_numericas);
            return newConfig;
          }
          
          // Caso não consiga inserir, retorna um objeto padrão
          return { id: "default", series_numericas: 1 };
        }
        
        if (data) {
          setSeriesNumericas(data.series_numericas);
        }
        
        return data;
      } catch (err) {
        console.error("Erro ao buscar configuração:", err);
        // Retornar um valor padrão para evitar problemas de renderização
        return { id: "default", series_numericas: 1 };
      } finally {
        setConfigLoaded(true);
      }
    }
  });

  const updateSeriesMutation = useMutation({
    mutationFn: async (series: number) => {
      // Verificar se temos uma configuração válida primeiro
      if (!configData) {
        // Se não temos configuração, inserir uma nova
        const { data, error } = await supabase
          .from("configuracao_campanha")
          .insert({ series_numericas: series })
          .select()
          .maybeSingle();
          
        if (error) throw error;
        return data;
      } else {
        // Se configData.id é "default", significa que não conseguimos obter um ID real
        // Nesse caso, vamos tentar obter a configuração primeiro
        if (configData.id === "default") {
          // Verificar se existe uma configuração
          const { data: existingConfig, error: fetchError } = await supabase
            .from("configuracao_campanha")
            .select("id")
            .maybeSingle();
          
          if (fetchError) throw fetchError;
          
          if (existingConfig) {
            // Atualizar configuração existente
            const { error } = await supabase
              .from("configuracao_campanha")
              .update({ series_numericas: series })
              .eq("id", existingConfig.id);
            
            if (error) throw error;
          } else {
            // Inserir nova configuração
            const { error } = await supabase
              .from("configuracao_campanha")
              .insert({ series_numericas: series });
            
            if (error) throw error;
          }
        } else {
          // Atualizar configuração existente com ID conhecido
          const { error } = await supabase
            .from("configuracao_campanha")
            .update({ series_numericas: series })
            .eq("id", configData.id);
          
          if (error) throw error;
        }
      }
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
      try {
        // Chamando a função Edge para gerar números
        const response = await fetch('https://uoovrxfpjsyvpkqdxkoa.supabase.co/functions/v1/gerar-numeros', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ documento, quantidade: parseInt(quantidade) })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Erro ao gerar números');
        }
        
        return result;
      } catch (error) {
        console.error("Erro completo:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Números gerados com sucesso",
        description: `Foram gerados ${data.numeros.length} números para o documento ${documento}`
      });
      setDocumento("");
      setQuantidade("");
    },
    onError: (error: any) => {
      // Verificar se é o erro específico de "Participante não cadastrado"
      if (error.message === "Participante não cadastrado") {
        toast({
          title: "Participante não cadastrado",
          description: "Este documento não pertence a um participante cadastrado.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: error instanceof Error ? error.message : "Erro ao gerar números",
          variant: "destructive"
        });
      }
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

  if (configError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar configurações. Recarregue a página e tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

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
            disabled={configLoading || updateSeriesMutation.isPending}
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
            disabled={configLoading || !configLoaded || gerarNumerosMutation.isPending}
          >
            {gerarNumerosMutation.isPending ? "Gerando..." : "Gerar Números"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ConfiguracaoCampanha;
