import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Language } from "./translations";
import { useRouter } from "expo-router";
import {
  CalculationParams,
  CalculationResult,
  MonthData,
  runCalculation,
  createDefaultMonthData,
} from "./calculator";

export type OfficeLocation = "vienna" | "dubai" | "manila" | "florida";

interface CalculationState {
  params: CalculationParams | null;
  result: CalculationResult | null;
  isLoading: boolean;
  error: string | null;
}

interface CalculatorContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  calculation: CalculationState;
  executeCalculation: (params: CalculationParams) => void;
  clearCalculation: () => void;
  saveCalculation: (name: string) => Promise<void>;
  loadCalculation: (id: string) => Promise<void>;
  getSavedCalculations: () => Promise<any[]>;
  deleteCalculation: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  // Partner Mode
  partnerMode: boolean;
  enablePartnerMode: (pin: string) => boolean;
  disablePartnerMode: () => void;
  // Office Location
  officeLocation: OfficeLocation;
  setOfficeLocation: (office: OfficeLocation) => Promise<void>;
}

const PARTNER_PIN = "4837";

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [partnerMode, setPartnerMode] = useState(false);
  const [officeLocation, setOfficeLocationState] = useState<OfficeLocation>("dubai");
  const [calculation, setCalculation] = useState<CalculationState>({
    params: null,
    result: null,
    isLoading: false,
    error: null,
  });

  React.useEffect(() => {
    loadPreferences();
  }, []);

  const router = useRouter();

  const loadPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem("calculator_language");
      if (saved && ["en", "nl", "de", "fr", "es", "ru", "zh"].includes(saved)) {
        setLanguageState(saved as Language);
      }
      const savedPartner = await AsyncStorage.getItem("partner_mode");
      if (savedPartner === "true") {
        setPartnerMode(true);
      }
      const savedOffice = await AsyncStorage.getItem("office_location");
      if (savedOffice && ["vienna", "dubai", "manila", "florida"].includes(savedOffice)) {
        setOfficeLocationState(savedOffice as OfficeLocation);
      }
      // Show onboarding on first launch
      const seen = await AsyncStorage.getItem("onboarding_seen");
      if (!seen) {
        router.replace("/onboarding");
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    }
  };

  const setLanguage = useCallback(async (lang: Language) => {
    try {
      await AsyncStorage.setItem("calculator_language", lang);
      setLanguageState(lang);
    } catch (error) {
      console.error("Failed to save language preference:", error);
    }
  }, []);

  const enablePartnerMode = useCallback((pin: string): boolean => {
    if (pin === PARTNER_PIN) {
      setPartnerMode(true);
      AsyncStorage.setItem("partner_mode", "true");
      return true;
    }
    return false;
  }, []);

  const disablePartnerMode = useCallback(() => {
    setPartnerMode(false);
    AsyncStorage.setItem("partner_mode", "false");
  }, []);

  const setOfficeLocation = useCallback(async (office: OfficeLocation) => {
    try {
      await AsyncStorage.setItem("office_location", office);
      setOfficeLocationState(office);
    } catch (error) {
      console.error("Failed to save office location:", error);
    }
  }, []);

  const executeCalculation = useCallback((params: CalculationParams) => {
    if (!params.startAmount || params.startAmount <= 0) {
      setCalculation((prev) => ({ ...prev, error: "Start amount must be greater than 0" }));
      return;
    }
    if (!params.years || params.years <= 0) {
      setCalculation((prev) => ({ ...prev, error: "Years must be greater than 0" }));
      return;
    }
    setCalculation((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = runCalculation(params);
      setCalculation({ params, result, isLoading: false, error: null });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Calculation failed";
      setCalculation((prev) => ({ ...prev, isLoading: false, error: msg }));
    }
  }, []);

  const clearCalculation = useCallback(() => {
    setCalculation({ params: null, result: null, isLoading: false, error: null });
  }, []);

  const saveCalculation = useCallback(
    async (name: string) => {
      if (!calculation.params || !calculation.result) throw new Error("No calculation to save");
      try {
        const id = Date.now().toString();
        const saved = {
          id,
          name,
          startAmount: calculation.params.startAmount,
          timestamp: new Date().toISOString(),
          params: calculation.params,
          summary: {
            totalIn: calculation.result.totalIn,
            totalOut: calculation.result.totalOut,
            finalCap: calculation.result.finalCap,
            netResult: calculation.result.netResult,
          },
        };
        const existing = await AsyncStorage.getItem("calculator_history");
        const history = existing ? JSON.parse(existing) : [];
        history.unshift(saved);
        await AsyncStorage.setItem("calculator_history", JSON.stringify(history));
      } catch (error) {
        console.error("Failed to save calculation:", error);
        throw error;
      }
    },
    [calculation]
  );

  const getSavedCalculations = useCallback(async () => {
    try {
      const existing = await AsyncStorage.getItem("calculator_history");
      return existing ? JSON.parse(existing) : [];
    } catch {
      return [];
    }
  }, []);

  const loadCalculation = useCallback(async (id: string) => {
    try {
      const existing = await AsyncStorage.getItem("calculator_history");
      if (!existing) return;
      const history = JSON.parse(existing);
      const saved = history.find((item: any) => item.id === id);
      if (saved) {
        const result = runCalculation(saved.params);
        setCalculation({ params: saved.params, result, isLoading: false, error: null });
      }
    } catch (error) {
      console.error("Failed to load calculation:", error);
    }
  }, []);

  const deleteCalculation = useCallback(async (id: string) => {
    try {
      const existing = await AsyncStorage.getItem("calculator_history");
      if (!existing) return;
      const history = JSON.parse(existing);
      const filtered = history.filter((item: any) => item.id !== id);
      await AsyncStorage.setItem("calculator_history", JSON.stringify(filtered));
    } catch (error) {
      console.error("Failed to delete calculation:", error);
      throw error;
    }
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      await AsyncStorage.removeItem("calculator_history");
    } catch (error) {
      console.error("Failed to clear history:", error);
      throw error;
    }
  }, []);

  const value: CalculatorContextType = {
    language,
    setLanguage,
    calculation,
    executeCalculation,
    clearCalculation,
    saveCalculation,
    loadCalculation,
    getSavedCalculations,
    deleteCalculation,
    clearHistory,
    partnerMode,
    enablePartnerMode,
    disablePartnerMode,
    officeLocation,
    setOfficeLocation,
  };

  return (
    <CalculatorContext.Provider value={value}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator() {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error("useCalculator must be used within CalculatorProvider");
  }
  return context;
}

export type { CalculationParams, MonthData };
