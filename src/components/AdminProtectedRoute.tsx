
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuth");
    setIsAdmin(adminAuth === "true");
    
    if (adminAuth !== "true") {
      toast({
        title: "Acesso restrito",
        description: "Esta área é restrita a administradores",
        variant: "destructive",
      });
    }
  }, []);

  // Aguardar a verificação de autenticação
  if (isAdmin === null) {
    return <div className="container mx-auto p-6">Verificando autenticação...</div>;
  }

  return isAdmin ? <>{children}</> : <Navigate to="/admin" />;
};

export default AdminProtectedRoute;
