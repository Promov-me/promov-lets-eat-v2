
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { LayoutGrid, List, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Participante = {
  documento: string;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  data_cadastro: string;
};

type NumeroSorte = {
  numero: number;
  created_at: string;
};

const Dashboard = () => {
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: participantes = [], isLoading: isLoadingParticipantes } = useQuery({
    queryKey: ["participantes", searchTerm],
    queryFn: async () => {
      const query = supabase
        .from("participantes")
        .select("*")
        .order("data_cadastro", { ascending: false });

      if (searchTerm) {
        query.or(`documento.ilike.%${searchTerm}%,nome.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Participante[];
    },
  });

  const { data: numerosPorParticipante = {}, isLoading: isLoadingNumeros } = useQuery({
    queryKey: ["numeros_sorte", participantes],
    queryFn: async () => {
      if (participantes.length === 0) return {};
      
      const documentos = participantes.map(p => p.documento);
      const { data, error } = await supabase
        .from("numeros_sorte")
        .select("numero, documento, created_at")
        .in("documento", documentos);

      if (error) throw error;

      const numerosAgrupados = data.reduce((acc: Record<string, NumeroSorte[]>, curr) => {
        if (!acc[curr.documento]) {
          acc[curr.documento] = [];
        }
        acc[curr.documento].push({ 
          numero: curr.numero, 
          created_at: curr.created_at 
        });
        return acc;
      }, {});

      return numerosAgrupados;
    },
    enabled: participantes.length > 0,
  });

  const isLoading = isLoadingParticipantes || isLoadingNumeros;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar por documento ou nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Toggle
            pressed={viewMode === "cards"}
            onPressedChange={() => setViewMode("cards")}
            aria-label="Visualização em cards"
          >
            <LayoutGrid className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={viewMode === "list"}
            onPressedChange={() => setViewMode("list")}
            aria-label="Visualização em lista"
          >
            <List className="h-4 w-4" />
          </Toggle>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Carregando dados...</div>
      ) : participantes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhum participante encontrado. {searchTerm && "Tente outra busca."}
        </div>
      ) : (
        <div className={viewMode === "cards" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
          {participantes.map((participante) => (
            <Card key={participante.documento} className="p-6">
              <div className="space-y-2">
                <h3 className="font-semibold">{participante.nome || "Nome não informado"}</h3>
                <p className="text-sm text-gray-500">Documento: {participante.documento}</p>
                <p className="text-sm text-gray-500">Email: {participante.email || "Não informado"}</p>
                <p className="text-sm text-gray-500">Telefone: {participante.telefone || "Não informado"}</p>
                <p className="text-sm text-gray-500">
                  Data de Cadastro: {new Date(participante.data_cadastro).toLocaleDateString()}
                </p>
                
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Números da Sorte:</h4>
                  <div className="max-h-40 overflow-y-auto">
                    {numerosPorParticipante[participante.documento]?.length > 0 ? (
                      numerosPorParticipante[participante.documento]?.map((numero, index) => (
                        <div key={index} className="text-sm mb-1 pb-1 border-b border-gray-100 last:border-0">
                          <span className="font-medium">{numero.numero.toString().padStart(6, '0')}</span> - 
                          <span className="text-gray-500 text-xs ml-1">
                            {new Date(numero.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Nenhum número gerado</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
