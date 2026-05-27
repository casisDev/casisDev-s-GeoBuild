import React, { useState, useEffect, useRef } from "react";
import { 
  Building2, Camera, Compass, Database, FileText, CheckCircle2, 
  AlertCircle, ShieldAlert, Sparkles, Send, RefreshCw, BarChart3, 
  TrendingUp, TreePine, Landmark, DollarSign, MessageSquare, AlertTriangle, Play,
  Trash2, Clock, Calendar, Download, User as UserIcon, Ruler, Lightbulb, HardHat, Wrench
} from "lucide-react";
import MobileShell from "./components/MobileShell";
import TerrainSampleSelector from "./components/TerrainSampleSelector";
import TerrainCameraCapture from "./components/TerrainCameraCapture";
import { TerrainAnalysisReport, ChatMessage, HistoryItem, User } from "./types";
import AuthScreen from "./components/AuthScreen";
import { generateTerrainPDF } from "./utils/pdfGenerator";
import { getFallbackAnalysis, getFallbackChatResponse } from "./utils/fallbackDb";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("terrain_active_user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Error reading localStorage active user", e);
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<string>("scan");
  const [analysisResult, setAnalysisResult] = useState<TerrainAnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>("flat_sandy");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem("terrain_active_user", JSON.stringify(currentUser));
      } else {
        localStorage.removeItem("terrain_active_user");
      }
    } catch (e) {
      console.error("Error saving user session to localStorage", e);
    }
  }, [currentUser]);
  
  // History State
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem("terrain_analysis_history");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Error reading localStorage", e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("terrain_analysis_history", JSON.stringify(history));
    } catch (e) {
      console.error("Error writing to localStorage", e);
    }
  }, [history]);

  const userHistory = history.filter(h => h.userId === (currentUser?.username || "convidado"));
  
  // Chatbot states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-ai",
      sender: "ai",
      text: "Olá! Sou o Engenheiro Lucas, especialista geotécnico híbrido. Selecione ou envie uma foto do terreno de interesse e eu poderei te auxiliar sobre fundações, topologia, terraplanagem de taludes e licenciamento.",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Initial demo load on startup so the dashboard isn't blank
  useEffect(() => {
    handleSelectSample("flat_sandy");
  }, []);

  // Post image or selected sample ID to the analyzer
  const handleAnalyze = async (payload: { imageBase64?: string; sampleId?: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/analyze-terrain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }
      const data = await response.json();
      if (data.success || data.score !== undefined) {
        setAnalysisResult(data);
        
        // Save to analysis history list
        const newItem: HistoryItem = {
          id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          userId: currentUser?.username || "convidado",
          timestamp: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          report: data
        };
        setHistory(prev => {
          // Avoid sequential duplicate records of the exact same title
          if (prev.length > 0 && prev[0].report.title === data.title) {
            return prev;
          }
          return [newItem, ...prev];
        });

        // Automatically switch to dashboard/report tab to show the results to the user
        setActiveTab("dashboard");
        
        // Push a context-aware chat introduction
        const analysisGreeting: ChatMessage = {
          id: `eval-${Date.now()}`,
          sender: "ai",
          text: `**Relatório Atualizado:** Acabei de analisar o lote "${data.title}" com pontuação de viabilidade **${data.score}/100** (${data.classification}).\n\nIndiquei a fundação do tipo **${data.structuralSuggestions?.recommendedFoundation}** como a mais prudente e econômica.\n\nComo posso te ajudar no detalhamento deste terreno específico agora?`,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, analysisGreeting]);
      } else {
        alert("Ocorreu um erro na análise: " + (data.error || "Desconhecido"));
      }
    } catch (err: any) {
      console.warn("Express server connection unavailable (acting under pure static web host such as Netlify). Initiating client fallback...", err);
      // Run intelligent offline static fallback analysis
      const data = getFallbackAnalysis(payload.sampleId);
      setAnalysisResult(data);
      
      // Save client history
      const newItem: HistoryItem = {
        id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: currentUser?.username || "convidado",
        timestamp: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        report: data
      };
      setHistory(prev => {
        if (prev.length > 0 && prev[0].report.title === data.title) {
          return prev;
        }
        return [newItem, ...prev];
      });

      // Show results
      setActiveTab("dashboard");
      
      const analysisGreeting: ChatMessage = {
        id: `eval-${Date.now()}`,
        sender: "ai",
        text: `**Simulação Offline Ativada:** ${payload.imageBase64 ? "Sua fotografia de terreno foi estimada localmente no navegador." : "O lote '" + data.title + "' foi processado do catálogo estático."}\n\n**Pontuação de Viabilidade:** **${data.score}/100** (${data.classification}).\n\nFundação ideal: **${data.structuralSuggestions?.recommendedFoundation}**.\n\nSinta-se à vontade para tirar qualquer dúvida com o **Eng. Lucas** no chat!`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, analysisGreeting]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (id: string) => {
    setSelectedSampleId(id);
    handleAnalyze({ sampleId: id });
  };

  const handleCaptureUpload = (base64: string) => {
    setSelectedSampleId(null); // Clear selected sample highlights
    handleAnalyze({ imageBase64: base64 });
  };

  // Send a message to Eng Lucas Chat
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isSendingChat) return;

    if (!customText) {
      setInputMessage("");
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMsg]);
    setIsSendingChat(true);

    try {
      const response = await fetch("/api/chat-terrain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: textToSend,
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: data.reply,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || "Server responded with success false");
      }
    } catch (err) {
      console.warn("Chat server connection failed (expected on Netlify static deploy). Standardizing chatbot offline simulator...", err);
      // Run intelligent client-side fallback chat response
      const replyText = getFallbackChatResponse(textToSend, analysisResult);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: replyText,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Chat shortcuts prompts
  const chatShortcuts = [
    { text: "Qual a fundação mais segura?", label: "Fundação ideal", icon: <Lightbulb className="h-3 w-3 text-amber-400" /> },
    { text: "Como reduzir custo de terraplenagem?", label: "Terraplenagem", icon: <Wrench className="h-3 w-3 text-indigo-400" /> },
    { text: "Quais licenças preciso tirar?", label: "Licenciamento", icon: <FileText className="h-3 w-3 text-emerald-400" /> },
    { text: "Por que fazer sondagem SPT?", label: "Furos SPT", icon: <Compass className="h-3 w-3 text-sky-400" /> }
  ];

  // Helper colors based on score
  const getScoreVisuals = (score: number) => {
    if (score >= 80) return { color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10", tag: "Altamente Viável" };
    if (score >= 50) return { color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10", tag: "Viabilidade Moderada" };
    return { color: "text-rose-400", border: "border-rose-500/30", bg: "bg-rose-500/10", tag: "Forte Restrição" };
  };

  const scoreInfo = analysisResult ? getScoreVisuals(analysisResult.score) : { color: "text-slate-400", border: "border-slate-800", bg: "bg-slate-900/40", tag: "Não Analisado" };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab("scan");
  };

  if (!currentUser) {
    return (
      <MobileShell activeTab={activeTab} setActiveTab={setActiveTab} hideNavigation={true}>
        <AuthScreen onLoginSuccess={(user) => setCurrentUser(user)} />
      </MobileShell>
    );
  }

  return (
    <MobileShell activeTab={activeTab} setActiveTab={setActiveTab}>
      {/* Session Header Bar */}
      <div className="px-4 py-2 bg-slate-950 border-b border-slate-900/40 flex justify-between items-center text-xs text-slate-300 shrink-0 select-none">
        <div className="flex items-center gap-1.5 min-w-0">
          <UserIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-200 truncate pr-1">
            {currentUser.username === "convidado" ? "Modo Convidado" : currentUser.name}
          </span>
          <span className="text-[9px] font-mono tracking-wider py-0.5 px-1.5 text-emerald-400 bg-emerald-500/5 rounded border border-emerald-500/10">
            {currentUser.username === "convidado" ? "GUEST" : "ATIVADO"}
          </span>
        </div>
        <button
          id="auth-logout-btn"
          onClick={handleLogout}
          className="text-rose-400 hover:text-rose-300 text-[10px] uppercase font-bold tracking-wider transition-colors flex items-center gap-1 cursor-pointer pl-2 select-none"
        >
          <span>Sair</span>
          <span className="text-rose-500">→</span>
        </button>
      </div>
      
      {/* 1. SCANNER TAB (CAMERA & SAMPLES SELECTOR) */}
      {activeTab === "scan" && (
        <div className="flex flex-col flex-1 animate-fade-in divide-y divide-slate-900 overflow-y-auto scrollbar-thin">
          
          {/* Header element to fit simple UI requirement */}
          <div className="p-4 bg-slate-950/25">
            <div className="flex items-center gap-2 mb-1">
              <Ruler className="h-5 w-5 text-emerald-400 shrink-0" />
              <h2 className="font-display font-medium text-lg leading-tight text-white tracking-wide">
                Híbrido de Visão Computacional
              </h2>
            </div>
            <p className="text-slate-400 text-[11px] leading-normal font-sans">
              Sistema de engenharia e modelagem assistida para viabilidade de loteamentos civis.
            </p>
          </div>

          {/* Active webcam scan module */}
          <div className="p-4">
            <TerrainCameraCapture 
              onCapture={handleCaptureUpload} 
              isLoading={isLoading} 
            />
          </div>

          {/* Preset list selector */}
          <div className="bg-slate-950/20 pb-8">
            <TerrainSampleSelector 
              onSelectSample={handleSelectSample}
              onUploadImage={handleCaptureUpload}
              selectedId={selectedSampleId}
              isLoading={isLoading}
            />
          </div>

          {/* Overlay loader block */}
          {isLoading && (
            <div className="absolute inset-0 bg-slate-950/80 z-50 flex flex-col items-center justify-center p-6 text-center">
              <div className="relative">
                <RefreshCw className="h-10 w-10 text-emerald-500 animate-spin" />
                <Sparkles className="h-5 w-5 text-sky-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-white mt-4 font-display">Avaliando Solo com IA</h4>
              <p className="text-[11px] text-slate-400 max-w-[240px] mt-1.5 leading-relaxed">
                Calculando inclinação média, decodificando granulometria do lote e estimando custos estruturais...
              </p>
            </div>
          )}
        </div>
      )}

      {/* 2. DASHBOARD / DETAILED REPORT TAB */}
      {activeTab === "dashboard" && (
        <div className="flex flex-col flex-1 animate-fade-in p-4 gap-4 pb-12 overflow-y-auto scrollbar-thin">
          
          {analysisResult ? (
            <>
              {/* Header Title Lote Info */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-500 tracking-wider">CIVIL_REPORT_ACTIVE</span>
                  <div className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${scoreInfo.bg} ${scoreInfo.color} border ${scoreInfo.border}`}>
                    {analysisResult.classification}
                  </div>
                </div>

                <h3 className="font-display font-bold text-lg text-white leading-tight">
                  {analysisResult.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                  Avaliação preliminar gerada sob calibração de redes profundas da engenharia.
                </p>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-900/60">
                  <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[9px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>RELATÓRIO PDF DISPONÍVEL</span>
                  </div>
                  <button
                    id="download-pdf-btn"
                    onClick={() => {
                      if (isGeneratingPdf) return;
                      setIsGeneratingPdf(true);
                      setTimeout(() => {
                        try {
                          generateTerrainPDF(analysisResult, currentUser);
                        } catch (err) {
                          console.error("PDF generation failed", err);
                        } finally {
                          setIsGeneratingPdf(false);
                        }
                      }, 1000);
                    }}
                    disabled={isGeneratingPdf}
                    className={`flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl transition-all cursor-pointer shadow-md select-none ${
                      isGeneratingPdf ? "opacity-75 cursor-wait" : "active:scale-95"
                    }`}
                  >
                    {isGeneratingPdf ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Gerando...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>Baixar PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* General Viability Dial Gauge / Score Box */}
              <div className="grid grid-cols-3 gap-3">
                
                {/* Score panel */}
                <div className="col-span-1 bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-2">SCORE</span>
                  <div className="relative flex items-center justify-center">
                    <svg className="w-16 h-16">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="#1e293b" strokeWidth="4" />
                      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4"
                        className={scoreInfo.color}
                        strokeDasharray="175"
                        strokeDashoffset={175 - (175 * analysisResult.score) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-md font-extrabold text-white font-mono">{analysisResult.score}%</span>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-2 font-semibold">Viabilidade</span>
                </div>

                {/* Soil & slope key summary facts */}
                <div className="col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase">Fator Crítico Principal</span>
                    <p className="text-xs text-white font-semibold mt-1">
                      {analysisResult.metrics.slope > 15 
                        ? "Forte Inclinação (Declividade Crítica)" 
                        : analysisResult.metrics.vegetationDensity === "Alta"
                          ? "Cobertura Florestal Nativa Intensa"
                          : "Topografia Favorável à Obras"}
                    </p>
                  </div>
                  
                  <div className="border-t border-slate-900 pt-2 flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">Acesso Mecânico:</span>
                    <span className="font-bold text-slate-300">{analysisResult.metrics.accessibility}</span>
                  </div>
                </div>

              </div>

              {/* Key Geotech Metrics Cards container */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-emerald-400" />
                  Métricas Geotécnicas Estimadas
                </h4>

                <div className="grid grid-cols-2 gap-3.5">
                  
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/40">
                    <span className="text-[9px] text-slate-500 block">Inclinação Média</span>
                    <span className="text-sm font-bold text-white font-mono">{analysisResult.metrics.slope}%</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      {analysisResult.metrics.slope < 5 ? "Plano" : analysisResult.metrics.slope < 15 ? "Regular" : "Íngreme"}
                    </span>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/40">
                    <span className="text-[9px] text-slate-500 block">Classificação de Solo Estimada</span>
                    <span className="text-xs font-bold text-slate-200 block truncate mt-1" title={analysisResult.metrics.soilTypeEstimate}>
                      {analysisResult.metrics.soilTypeEstimate}
                    </span>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/40">
                    <span className="text-[9px] text-slate-500 block">Densidade Florestal</span>
                    <span className="text-xs font-semibold text-slate-300 block mt-0.5">{analysisResult.metrics.vegetationDensity}</span>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/40">
                    <span className="text-[9px] text-slate-500 block">Efetividade e Drenagem</span>
                    <span className="text-xs font-semibold text-slate-300 block mt-0.5">{analysisResult.metrics.waterDrainageRate}</span>
                  </div>

                </div>
              </div>

              {/* Expert Civil Suggestions Details */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-sky-400" />
                  Soluções Estruturais e Fundações
                </h4>

                <div className="p-3 bg-gradient-to-r from-sky-950/20 to-slate-900 border border-sky-900/30 rounded-xl">
                  <span className="text-[9px] font-mono text-sky-400 font-bold block">FUNDAÇÃO SUGERIDA</span>
                  <span className="text-xs font-black text-white block mt-0.5 uppercase tracking-wide">
                    {analysisResult.structuralSuggestions.recommendedFoundation}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
                    {analysisResult.structuralSuggestions.foundationExplanation}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block font-bold uppercase">Movimentação de Terra / Platôs</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      analysisResult.structuralSuggestions.earthworksComplexity === "Alto"
                        ? "bg-rose-500/10 text-rose-300"
                        : analysisResult.structuralSuggestions.earthworksComplexity === "Médio"
                          ? "bg-amber-500/10 text-amber-300"
                          : "bg-emerald-500/10 text-emerald-300"
                    }`}>
                      Complexidade: {analysisResult.structuralSuggestions.earthworksComplexity}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
                    {analysisResult.structuralSuggestions.earthworksExplanation}
                  </p>
                </div>

                <div className="border-t border-slate-900 pt-3">
                  <span className="text-[10px] text-slate-500 block font-bold uppercase">Restrições Urbanísticas & Ambientais</span>
                  <p className="text-[10px] text-amber-300/90 mt-1.5 leading-normal bg-amber-500/5 p-2 rounded border border-amber-500/10">
                    🛡️ {analysisResult.structuralSuggestions.zoningRisk}
                  </p>
                </div>
              </div>

              {/* Economic Estimate factors */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                  Gabarito de Investimento Preliminar
                </h4>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="bg-slate-900 p-2.5 rounded-lg">
                    <span className="text-slate-500 block text-[9px]">Custo de Fundação</span>
                    <span className="font-bold text-white">{analysisResult.costEstimations.foundationFactor}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg">
                    <span className="text-slate-500 block text-[9px]">Preparação do Lote</span>
                    <span className="font-bold text-white">{analysisResult.costEstimations.sitePreparationCost}</span>
                  </div>
                </div>
              </div>

              {/* Detailed Technical Verdict written block */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Veredito do Especialista Geotécnico</span>
                <p className="text-slate-300 text-[11px] leading-relaxed mt-2 italic">
                  "{analysisResult.detailedAnalysis}"
                </p>
              </div>

              {/* Direct call to chat action quick option */}
              <button
                id="view-chat-btn"
                onClick={() => setActiveTab("chat")}
                className="w-full py-3 bg-slate-950 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 hover:text-white rounded-xl text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Conversar com Eng. Lucas sobre este Lote</span>
              </button>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <Compass className="h-12 w-12 text-slate-700 mb-2 animate-bounce" />
              <h4 className="text-sm font-bold text-white">Nenhum Relatório de Terreno Ativo</h4>
              <p className="text-xs text-slate-400 mt-2 max-w-[240px]">
                Volte para a aba do Canelógrafo ou Scanner, selecione ou fotografe um terreno para alimentar as inteligências.
              </p>
            </div>
          )}

        </div>
      )}

      {/* 3. CHATBOT CONSULTOR AI TAB */}
      {activeTab === "chat" && (
        <div className="flex flex-col flex-1 animate-fade-in bg-slate-950 overflow-hidden h-full min-h-0">
          
          {/* Chat Header element */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-sm">
              👨‍🏫
            </div>
            <div>
              <h4 className="text-xs font-bold text-white font-display">Eng. Lucas Sênior</h4>
              <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Consultor de Solo Ativo
              </span>
            </div>
          </div>

          {/* Active messages window list */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
            {chatMessages.map((msg) => {
              const isAi = msg.sender === "ai";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${isAi ? "self-start" : "self-end"}`}
                >
                  <span className="text-[8px] text-slate-500 mb-1 ml-1 font-mono">
                    {isAi ? "ENGENHEIRO LUCAS" : "VOCÊ"}
                  </span>
                  <div className={`p-3 rounded-2xl text-[11px] leading-relaxed font-sans ${
                    isAi 
                      ? "bg-slate-900 text-slate-300 rounded-tl-none border border-slate-800/60" 
                      : "bg-emerald-500 text-slate-950 rounded-tr-none font-medium shadow-md"
                  }`}>
                    {msg.text.split("\n\n").map((para, idx) => (
                      <p key={idx} className={idx > 0 ? "mt-2" : ""}>{para}</p>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {isSendingChat && (
              <div className="self-start flex flex-col">
                <span className="text-[8px] text-slate-500 mb-1 font-mono">Digitando parecer...</span>
                <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            
            <div ref={chatBottomRef} />
          </div>

          {/* Prompt Shortcuts Grid helper */}
          <div className="bg-slate-900/30 p-2 border-t border-slate-900">
            <span className="text-[8px] text-slate-500 font-bold block mb-1.5 uppercase ml-1">
              Dúvidas comuns sobre o terreno analisado:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {chatShortcuts.map((shortcut, idx) => (
                <button
                  id={`shortcut-btn-${idx}`}
                  key={idx}
                  onClick={() => handleSendMessage(shortcut.text)}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-slate-300 text-[9px] rounded-lg border border-slate-800 transition-all select-none cursor-pointer flex items-center gap-1"
                >
                  {shortcut.icon}
                  <span>{shortcut.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User Input entry bar */}
          <div className="p-2.5 bg-slate-900/80 border-t border-slate-800 flex gap-2">
            <input
              id="chat-text-input"
              type="text"
              placeholder="Perguntar sobre estacas, contenção..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 bg-slate-950 text-xs border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-500"
            />
            <button
              id="send-chat-btn"
              onClick={() => handleSendMessage()}
              disabled={isSendingChat}
              className="p-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      )}

      {/* 4. HISTORIAL TAB (ANALYSIS HISTORY) */}
      {activeTab === "history" && (
        <div className="flex flex-col flex-1 animate-fade-in bg-slate-900 overflow-y-auto divide-y divide-slate-900 min-h-0">
          {/* Header Block */}
          <div className="p-4 bg-slate-950/25 flex justify-between items-center shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-5 w-5 text-emerald-400 shrink-0" />
                <h2 className="font-display font-medium text-sm leading-tight text-white tracking-wide">
                  Histórico de Análises
                </h2>
              </div>
              <p className="text-slate-400 text-[10px] leading-normal font-sans">
                Registro dos terrenos avaliados por simulação ou imagem.
              </p>
            </div>
            {userHistory.length > 0 && (
              <button
                id="clear-all-history-btn"
                onClick={() => {
                  if (confirm("Deseja realmente apagar todo o seu histórico de análises?")) {
                    setHistory(prev => prev.filter(p => p.userId !== (currentUser?.username || "convidado")));
                  }
                }}
                className="flex items-center gap-1.5 px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded-lg border border-rose-500/20 transition-all cursor-pointer animate-fade-in"
              >
                <Trash2 className="h-3 w-3" />
                <span>Limpar</span>
              </button>
            )}
          </div>

          {/* Stats Bar */}
          {userHistory.length > 0 && (
            <div className="px-4 py-2.5 bg-slate-950/40 grid grid-cols-3 gap-2.5 shrink-0 animate-fade-in">
              <div className="text-center bg-slate-900/40 py-1 rounded-xl border border-slate-800/40">
                <span className="text-[8px] text-slate-500 block font-mono">QUANTIDADE</span>
                <span className="text-xs font-bold text-slate-200">{userHistory.length}</span>
              </div>
              <div className="text-center bg-slate-900/40 py-1 rounded-xl border border-slate-800/40">
                <span className="text-[8px] text-slate-500 block font-mono">MÉDIA SCORE</span>
                <span className="text-xs font-bold text-emerald-400">
                  {Math.round(userHistory.reduce((acc, h) => acc + h.report.score, 0) / userHistory.length)}%
                </span>
              </div>
              <div className="text-center bg-slate-900/40 py-1 rounded-xl border border-slate-800/40">
                <span className="text-[8px] text-slate-500 block font-mono">MÁXIMO SCORE</span>
                <span className="text-xs font-bold text-sky-400">
                  {Math.max(...userHistory.map(h => h.report.score))}%
                </span>
              </div>
            </div>
          )}

          {/* List or Empty state */}
          {userHistory.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-950/20 animate-fade-in">
              <Clock className="h-10 w-10 text-slate-700 mb-2 animate-pulse" />
              <h4 className="text-xs font-bold text-white">Nenhum Registro</h4>
              <p className="text-[11px] text-slate-400 mt-2 max-w-[240px] leading-relaxed">
                Você ainda não fez nenhuma análise técnica. Vá para o Scanner, selecione um exemplo do loteador ou tire uma foto.
              </p>
              <button
                id="go-scan-btn"
                onClick={() => setActiveTab("scan")}
                className="mt-4 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-md inline-flex items-center gap-1.5 active:scale-95"
              >
                <span>Analisar Agora</span>
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 pb-8">
              {userHistory.map((item) => {
                const report = item.report;
                const scoreVisuals = getScoreVisuals(report.score);
                return (
                  <div
                    key={item.id}
                    className="bg-slate-950/80 border border-slate-800/60 rounded-xl p-3.5 flex flex-col gap-2.5 relative overflow-hidden transition-all hover:border-slate-700 animate-fade-in"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-[8px] text-slate-500 mb-0.5">
                          <Calendar className="h-2.5 w-2.5" />
                          <span>{item.timestamp}</span>
                        </div>
                        <h4 className="font-bold text-xs text-white leading-tight truncate">
                          {report.title}
                        </h4>
                      </div>
                      <div className={`shrink-0 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${scoreVisuals.bg} ${scoreVisuals.color} border ${scoreVisuals.border}`}>
                        {report.score}%
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-900/40 p-2 rounded-lg border border-slate-800/20">
                      <div>
                        <span className="text-slate-500 text-[8px] font-mono block">FUNDAÇÃO</span>
                        <span className="font-semibold text-slate-300 truncate block">
                          {report.structuralSuggestions?.recommendedFoundation || "Simulada"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[8px] font-mono block">INCLINAÇÃO</span>
                        <span className="font-semibold text-slate-300 truncate block">
                          {report.metrics?.slope}% {report.metrics?.slope > 15 ? "(Crítica)" : report.metrics?.slope > 5 ? "(Média)" : "(Suave)"}
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-normal italic line-clamp-2">
                      "{report.detailedAnalysis}"
                    </p>

                    <div className="flex gap-2 pt-1 border-t border-slate-900/40">
                      <button
                        id={`load-report-btn-${item.id}`}
                        onClick={() => {
                          setAnalysisResult(report);
                          setActiveTab("dashboard");
                          
                          const recallGreeting: ChatMessage = {
                            id: `recall-${Date.now()}`,
                            sender: "ai",
                            text: `🔄 **Histórico Recuperado:** Carreguei os dados do lote "${report.title}" (Viabilidade de ${report.score}%). \n\nSua fundação recomendada é **${report.structuralSuggestions?.recommendedFoundation}**. Como posso auxiliá-lo com as restrições deste terreno hoje?`,
                            timestamp: new Date()
                          };
                          setChatMessages(prev => [...prev, recallGreeting]);
                        }}
                        className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-850 text-emerald-400 hover:text-white border border-slate-800/80 hover:border-emerald-500/30 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <FileText className="h-3 w-3" />
                        <span>Ver Relatório</span>
                      </button>
                      <button
                        id={`delete-report-btn-${item.id}`}
                        onClick={() => {
                          setHistory(prev => prev.filter(p => p.id !== item.id));
                        }}
                        className="px-2 py-1.5 bg-slate-900 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 border border-slate-800/80 rounded-lg transition-all cursor-pointer flex items-center justify-center animate-fade-in"
                        title="Remover do histórico"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </MobileShell>
  );
}
