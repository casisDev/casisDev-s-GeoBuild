import React, { useState, useEffect } from "react";
import { Smartphone, Monitor, Shield, Zap, Signal, Wifi, Battery } from "lucide-react";

interface MobileShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hideNavigation?: boolean;
}

export default function MobileShell({ children, activeTab, setActiveTab, hideNavigation = false }: MobileShellProps) {
  const [isMobileMode, setIsMobileMode] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>("12:00");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: "scan", label: "Scanner", icon: "📷" },
    { id: "dashboard", label: "Relatório", icon: "📊" },
    { id: "chat", label: "Consultor AI", icon: "💬" },
    { id: "history", label: "Histórico", icon: "🕒" }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col justify-between transition-colors duration-300">
      {/* External Top Utility Bar */}
      <div className="bg-slate-950 px-4 py-3 flex text-xs flex-col md:flex-row items-center justify-between border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="font-medium text-slate-300">
            Protótipo MobilHíbrido v2.1 • Análise e Viabilidade de Terrenos com IA
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400">Arraque de Computação de Visão: <strong className="text-emerald-400">Gemini Active</strong></span>
          <button
            id="toggle-view-mode"
            onClick={() => setIsMobileMode(!isMobileMode)}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-all active:scale-95 text-xs font-medium cursor-pointer"
          >
            {isMobileMode ? (
              <>
                <Monitor className="h-3.5 w-3.5 text-blue-400" />
                <span>Modo Tela Cheia (Foco Web)</span>
              </>
            ) : (
              <>
                <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
                <span>Simulador Celular (Mobile App)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Container Wrapper */}
      <div className="flex-1 flex items-center justify-center p-2 md:p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        
        {isMobileMode ? (
          /* Phone Shell Simulator Wrap */
          <div className="relative w-full max-w-[390px] h-[780px] bg-slate-950 rounded-[48px] border-[12px] border-slate-800 shadow-2xl overflow-hidden flex flex-col ring-8 ring-slate-900/40">
            {/* Front Camera Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-40 h-6 bg-slate-900 rounded-full flex items-center justify-center z-50">
              <span className="w-2.5 h-2.5 bg-sky-950 rounded-full border border-sky-900 animate-pulse"></span>
              <span className="w-10 h-1.5 bg-slate-800 rounded-full ml-4"></span>
            </div>

            {/* Mobile Top Status Bar */}
            <div className="h-12 bg-slate-950 px-6 pt-5 flex items-center justify-between z-40 text-xs font-semibold text-slate-300 select-none">
              <span>{currentTime}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded font-mono">5G</span>
                <Signal className="h-3.5 w-3.5 text-slate-300" />
                <Wifi className="h-3.5 w-3.5 text-slate-300" />
                <Battery className="h-3.5 w-3.5 text-emerald-400 fill-emerald-500/20" />
              </div>
            </div>

            {/* Phone Simulated Screen Content */}
            <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden bg-slate-900 relative">
              {children}
            </div>

            {/* Simulated home indicator line */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-700 rounded-full z-40"></div>

            {/* Mobile Bottom Navigation Bar */}
            {!hideNavigation && (
              <div className="h-16 bg-slate-950 border-t border-slate-900 px-6 flex items-center justify-around pb-2 z-40">
                {menuItems.map((item) => {
                  const isSelected = activeTab === item.id;
                  return (
                    <button
                      id={`menu-btn-${item.id}`}
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className="flex flex-col items-center justify-center gap-1 cursor-pointer group"
                    >
                      <div className={`text-xl transition-all duration-300 ${isSelected ? "scale-110" : "opacity-60 group-hover:opacity-100"}`}>
                        {item.icon}
                      </div>
                      <span className={`text-[10px] font-medium transition-all ${isSelected ? "text-emerald-400 font-semibold" : "text-slate-500"}`}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Wide Desktop Layout Wrapper */
          <div className="w-full max-w-6xl h-[780px] bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            {/* Top Bar for Desktop */}
            <div className="h-14 bg-slate-950 border-b border-indigo-950/40 px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">📐</span>
                <span className="font-display font-semibold text-slate-200 tracking-wide text-sm md:text-md">
                  Sistema de Engenharia Civil Híbrido IA
                </span>
              </div>
              
              {!hideNavigation ? (
                <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                  {menuItems.map((item) => {
                    const isSelected = activeTab === item.id;
                    return (
                      <button
                        id={`tab-desktop-${item.id}`}
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                          isSelected 
                            ? "bg-emerald-500 text-slate-950 shadow-md font-bold" 
                            : "text-slate-400 hover:text-slate-100"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 animate-pulse">
                  🔐 Terminal Protegido
                </span>
              )}
            </div>

            {/* Desktop Screen Content */}
            <div className="flex-1 flex overflow-hidden bg-slate-900 relative">
              {children}
            </div>
          </div>
        )}
      </div>

      {/* Human Literal footer note */}
      <footer className="bg-slate-950 py-3 text-center border-t border-slate-900 text-[11px] text-slate-500 font-mono tracking-wide">
        Dispositivo Móvel Configurado para Ingressos Autômatos de Construção Civil • 2026
      </footer>
    </div>
  );
}
