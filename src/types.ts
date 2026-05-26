export interface TerrainMetrics {
  slope: number;
  vegetationDensity: "Nenhuma" | "Baixa" | "Média" | "Alta" | "Área de Preservação";
  soilTypeEstimate: string;
  accessibility: "Excelente" | "Boa" | "Limitada" | "Difícil";
  waterDrainageRate: "Boa" | "Regular" | "Pobre / Encharcado";
}

export interface StructuralSuggestions {
  recommendedFoundation: string;
  foundationExplanation: string;
  earthworksComplexity: "Baixo" | "Médio" | "Alto";
  earthworksExplanation: string;
  zoningRisk: string;
}

export interface EnvironmentalImpact {
  riskLevel: "Baixo" | "Moderado" | "Alto" | "Crítico";
  defestationRequired: boolean;
  licensingDifficulty: "Fácil" | "Moderado" | "Complexo";
}

export interface CostEstimations {
  foundationFactor: "Econômico" | "Padrão" | "Oneroso" | "Muito Elevado";
  sitePreparationCost: string;
}

export interface TerrainAnalysisReport {
  success: boolean;
  title: string;
  score: number;
  classification: "Altamente Viável" | "Viabilidade Moderada" | "Baixa Viabilidade" | "Inviável temporariamente";
  metrics: TerrainMetrics;
  structuralSuggestions: StructuralSuggestions;
  environmentalImpact: EnvironmentalImpact;
  costEstimations: CostEstimations;
  detailedAnalysis: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

export interface SampleTerrain {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string; // Base64 placeholder or real visual representation
}

export interface HistoryItem {
  id: string;
  userId?: string; // Scoped to specific user
  timestamp: string;
  report: TerrainAnalysisReport;
}

export interface User {
  username: string;
  name: string;
  createdAt: string;
}
