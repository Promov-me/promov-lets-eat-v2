
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConfiguracaoCampanha from "@/components/ConfiguracaoCampanha";
import Dashboard from "@/components/Dashboard";
import ParticipanteDashboard from "@/components/ParticipanteDashboard";

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // Verificar autenticação do administrador
  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuth");
    if (adminAuth !== "true") {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar autenticado como administrador",
        variant: "destructive",
      });
      navigate("/admin");
    }
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
    navigate("/admin");
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-center mb-8">
        <img alt="Logo" className="h-24" src="/lovable-uploads/264c2e58-5519-4fec-8e18-8121764d8758.png" />
      </div>
      
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Painel Administrativo</h1>
        <Button variant="destructive" onClick={handleLogout}>Sair</Button>
      </div>
      
      <Card className="p-6">
        <Tabs defaultValue="configuracao" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 mb-2">
            <TabsTrigger value="configuracao">Configuração da Campanha</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="consulta">Consulta de Números</TabsTrigger>
          </TabsList>
          
          <TabsContent value="configuracao">
            <ConfiguracaoCampanha />
          </TabsContent>
          
          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>
          
          <TabsContent value="consulta">
            <ParticipanteDashboard />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default AdminDashboard;
