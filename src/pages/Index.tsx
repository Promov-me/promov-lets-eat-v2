
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConfiguracaoCampanha from "@/components/ConfiguracaoCampanha";
import Dashboard from "@/components/Dashboard";
import ParticipanteDashboard from "@/components/ParticipanteDashboard";

const Index = () => {
  return <div className="container mx-auto p-6">
      <div className="flex justify-center mb-8">
        <img alt="Logo" className="h-24" src="/lovable-uploads/264c2e58-5519-4fec-8e18-8121764d8758.png" />
      </div>
      
      <Card className="p-6">
        <Tabs defaultValue="configuracao" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
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
    </div>;
};
export default Index;
