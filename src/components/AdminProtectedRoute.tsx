
import React from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { toast } from "@/hooks/use-toast";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="container mx-auto p-6">Verificando autenticação...</div>;
  }

  // If not authenticated, redirect to login and show notification
  if (!isAuthenticated) {
    toast({
      title: "Acesso restrito",
      description: "Esta área é restrita a administradores",
      variant: "destructive",
    });
    return <Navigate to="/admin" />;
  }

  // User is authenticated, render children
  return <>{children}</>;
};

export default AdminProtectedRoute;
