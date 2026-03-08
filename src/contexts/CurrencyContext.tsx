import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type Currency = "KES" | "USD";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rate: number; // KES per 1 USD
  convertPrice: (kesAmount: number) => number;
  formatPrice: (kesAmount: number) => string;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const FALLBACK_RATE = 129; // fallback KES/USD
const CACHE_KEY = "realtravo_currency";
const RATE_CACHE_KEY = "realtravo_exchange_rate";
const RATE_CACHE_DURATION = 3600000; // 1 hour

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem(CACHE_KEY) as Currency) || "KES";
  });
  const [rate, setRate] = useState(FALLBACK_RATE);
  const [loading, setLoading] = useState(false);

  // Fetch live exchange rate
  useEffect(() => {
    const fetchRate = async () => {
      // Check cache first
      const cached = localStorage.getItem(RATE_CACHE_KEY);
      if (cached) {
        const { rate: cachedRate, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < RATE_CACHE_DURATION) {
          setRate(cachedRate);
          return;
        }
      }
      
      setLoading(true);
      try {
        const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        if (res.ok) {
          const data = await res.json();
          const kesRate = data.rates?.KES || FALLBACK_RATE;
          setRate(kesRate);
          localStorage.setItem(RATE_CACHE_KEY, JSON.stringify({ rate: kesRate, timestamp: Date.now() }));
        }
      } catch {
        // Use fallback
      } finally {
        setLoading(false);
      }
    };
    fetchRate();
  }, []);

  // Auto-detect from user profile country
  useEffect(() => {
    const detectCurrency = async () => {
      if (!user) return;
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) return; // user already chose

      const { data } = await supabase
        .from("profiles")
        .select("country")
        .eq("id", user.id)
        .single();
      
      if (data?.country && data.country !== "Kenya") {
        setCurrencyState("USD");
        localStorage.setItem(CACHE_KEY, "USD");
      }
    };
    detectCurrency();
  }, [user]);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem(CACHE_KEY, c);
  }, []);

  const convertPrice = useCallback((kesAmount: number) => {
    if (currency === "KES") return kesAmount;
    return Math.round((kesAmount / rate) * 100) / 100;
  }, [currency, rate]);

  const formatPrice = useCallback((kesAmount: number) => {
    if (currency === "KES") return `KSh ${kesAmount.toLocaleString()}`;
    const usd = Math.round((kesAmount / rate) * 100) / 100;
    return `$${usd.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }, [currency, rate]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rate, convertPrice, formatPrice, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};
