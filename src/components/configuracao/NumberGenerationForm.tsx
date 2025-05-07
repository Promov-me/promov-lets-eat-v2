
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const NumberGenerationForm = ({ isLoading }: { isLoading: boolean }) => {
  const { toast } = useToast();
  const [documento, setDocumento] = useState("");
  const [quantidade, setQuantidade] = useState("");

  const gerarNumerosMutation = useMutation({
    mutationFn: async ({ documento, quantidade }: { documento: string; quantidade: string }) => {
      try {
        // Usar o client do Supabase para chamar a função Edge
        const { data, error } = await supabase.functions.invoke('gerar-numeros', {
          body: JSON.stringify({ 
            documento, 
            quantidade: parseInt(quantidade) 
          })
        });
        
        if (error) {
          console.error("Erro ao chamar função Edge:", error);
          throw new Error(error.message || 'Erro ao gerar números');
        }
        
        if (!data.success) {
          throw new Error(data.error || 'Erro ao gerar números');
        }
        
        return data;
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
      // Verificar mensagens específicas de erro
      if (error.message?.includes("Documento não encontrado")) {
        toast({
          title: "Documento não encontrado",
          description: "Este documento não pertence a um participante cadastrado.",
          variant: "destructive"
        });
      } else if (error.message?.includes("Participante não cadastrado")) {
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
          disabled={isLoading || gerarNumerosMutation.isPending}
        >
          {gerarNumerosMutation.isPending ? "Gerando..." : "Gerar Números"}
        </Button>
      </form>
    </Card>
  );
};

export default NumberGenerationForm;
