
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";

const Auth = () => {
  return (
    <div className="container max-w-md mx-auto p-6">
      <Card className="p-4">
        <Tabs defaultValue="login" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 mb-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Cadastro</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-xl">Acesse sua conta</CardTitle>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </TabsContent>
          
          <TabsContent value="register">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-xl">Cadastre-se</CardTitle>
            </CardHeader>
            <CardContent>
              <RegisterForm />
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
