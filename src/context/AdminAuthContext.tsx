
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin token exists
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      verifyToken(adminToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      // Verify the token is valid
      // Fix TypeScript error by using an explicit type definition for the parameters
      const { data, error } = await supabase.rpc('verify_admin', { 
        token: token 
      } as Record<string, string>);
      
      setIsAuthenticated(Boolean(data));
    } catch (error) {
      console.error("Error verifying token:", error);
      setIsAuthenticated(false);
      localStorage.removeItem("adminToken");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Call the admin-auth function
      const response = await supabase.functions.invoke('admin-auth', {
        body: { email, password }
      });
      
      const { success, token, error } = response.data;
      
      if (success && token) {
        localStorage.setItem("adminToken", token);
        setIsAuthenticated(true);
        return true;
      } else {
        toast({
          title: "Falha na autenticação",
          description: error || "Credenciais inválidas",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast({
        title: "Erro de autenticação",
        description: "Ocorreu um erro inesperado durante o login",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
