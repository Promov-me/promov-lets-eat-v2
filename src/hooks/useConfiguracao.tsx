
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const useConfiguracao = () => {
  const [configLoaded, setConfigLoaded] = useState(false);
  const [seriesNumericas, setSeriesNumericas] = useState(1);

  const {
    data: configData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["configuracao"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("configuracao_campanha")
          .select("*");
        
        if (error) {
          console.error("Erro ao buscar configuração:", error);
          throw error;
        }
        
        // Se não existir configuração, criar uma
        if (!data || data.length === 0) {
          console.log("Configuração não encontrada, criando padrão");
          const { data: newConfig, error: insertError } = await supabase
            .from("configuracao_campanha")
            .insert({ series_numericas: 1 })
            .select();
          
          if (insertError) {
            console.error("Erro ao inserir configuração padrão:", insertError);
            throw insertError;
          }
          
          if (newConfig && newConfig.length > 0) {
            setSeriesNumericas(newConfig[0].series_numericas);
            return newConfig[0];
          }
        }
        
        if (data && data.length > 0) {
          console.log("Configuração encontrada:", data[0]);
          setSeriesNumericas(data[0].series_numericas);
          return data[0];
        }
        
        return null;
      } catch (err) {
        console.error("Erro ao buscar configuração:", err);
        return null;
      } finally {
        setConfigLoaded(true);
      }
    }
  });

  const ErrorComponent = error ? (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Erro ao carregar configurações. Recarregue a página e tente novamente.
      </AlertDescription>
    </Alert>
  ) : null;

  return {
    configData,
    isLoading,
    error,
    refetch,
    configLoaded,
    seriesNumericas,
    ErrorComponent
  };
};
