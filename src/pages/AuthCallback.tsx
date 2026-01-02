import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // O Supabase detecta o hash na URL automaticamente ao carregar.
    // Nós só precisamos verificar se a sessão foi criada.
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Login confirmado? Manda para a Home limpa
        navigate("/");
      } else if (event === "SIGNED_OUT") {
        // Algo deu errado ou não logou? Manda pro login
        navigate("/auth");
      }
    });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg text-gray-500">Autenticando...</p>
    </div>
  );
};

export default AuthCallback;