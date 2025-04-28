
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { LayoutGrid, List } from "lucide-react";
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

  const { data: participantes = [] } = useQuery({
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

  const { data: numerosPorParticipante = {} } = useQuery({
    queryKey: ["numeros_sorte", participantes],
    queryFn: async () => {
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
        acc[curr.documento].push({ numero: curr.numero, created_at: curr.created_at });
        return acc;
      }, {});

      return numerosAgrupados;
    },
    enabled: participantes.length > 0,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Buscar por documento ou nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Toggle
            pressed={viewMode === "cards"}
            onPressedChange={() => setViewMode("cards")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={viewMode === "list"}
            onPressedChange={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Toggle>
        </div>
      </div>

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
                  {numerosPorParticipante[participante.documento]?.map((numero, index) => (
                    <div key={index} className="text-sm">
                      {numero.numero.toString().padStart(6, '0')} - 
                      {new Date(numero.created_at).toLocaleDateString()}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
