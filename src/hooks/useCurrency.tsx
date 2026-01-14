import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Currency = "BRL" | "USD" | "EUR" | "JPY";

interface CurrencyConfig {
  code: Currency;
  symbol: string;
  locale: string;
  name: string;
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: "BRL", symbol: "R$", locale: "pt-BR", name: "Real Brasileiro" },
  { code: "USD", symbol: "$", locale: "en-US", name: "US Dollar" },
  { code: "EUR", symbol: "€", locale: "de-DE", name: "Euro" },
  { code: "JPY", symbol: "¥", locale: "ja-JP", name: "Yen Japonês" },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (value: number) => string;
  getCurrencyConfig: () => CurrencyConfig;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem("app-currency");
    return (saved as Currency) || "BRL";
  });

  // Load currency from user profile when authenticated
  useEffect(() => {
    const loadUserCurrency = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("currency")
        .eq("id", user.id)
        .single();

      if (profile?.currency) {
        setCurrencyState(profile.currency as Currency);
        localStorage.setItem("app-currency", profile.currency);
      }
    };

    loadUserCurrency();
  }, [user]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("app-currency", currency);
  }, [currency]);

  const setCurrency = async (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem("app-currency", newCurrency);

    // Save to user profile if authenticated
    if (user) {
      await supabase
        .from("profiles")
        .update({ currency: newCurrency })
        .eq("id", user.id);
    }
  };

  const getCurrencyConfig = (): CurrencyConfig => {
    return CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  };

  const formatCurrency = (value: number): string => {
    const config = getCurrencyConfig();
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.code,
      minimumFractionDigits: config.code === "JPY" ? 0 : 0,
      maximumFractionDigits: config.code === "JPY" ? 0 : 0,
    }).format(value);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, getCurrencyConfig }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
