import React from "react";
import { Camera, BarChart3, MessageSquare, Clock, Ruler } from "lucide-react";

interface MobileShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hideNavigation?: boolean;
}

export default function MobileShell({ children, activeTab, setActiveTab, hideNavigation = false }: MobileShellProps) {
  const menuItems = [
    { id: "scan", label: "Scanner", icon: <Camera className="h-5 w-5" /> },
    { id: "dashboard", label: "Relatório", icon: <BarChart3 className="h-5 w-5" /> },
    { id: "chat", label: "Consultor AI", icon: <MessageSquare className="h-5 w-5" /> },
    { id: "history", label: "Histórico", icon: <Clock className="h-5 w-5" /> }
  ];

  return (
    <div className="h-[100dvh] w-full bg-slate-900 text-slate-100 font-sans flex flex-col justify-between overflow-hidden relative">
      {/* Sleek, Elegant Unified Top Header Bar */}
      <div className="h-14 bg-slate-950 border-b border-slate-900/65 px-4 md:px-6 flex items-center justify-between shrink-0 select-none z-40">
        <div className="flex items-center gap-2.5">
          <Ruler className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <h1 className="font-display font-black text-xs md:text-sm text-slate-100 tracking-wider uppercase">
              Análise Geotécnica IA
            </h1>
            <p className="text-[9px] text-slate-500 font-medium tracking-wide hidden sm:block">
              Engenharia Civil & Viabilidade de Loteamentos
            </p>
          </div>
        </div>

        {/* Inline Top Bar Tabs Navigation for Tablets & Large Screens */}
        {!hideNavigation && (
          <div className="hidden sm:flex bg-slate-900 p-1 rounded-lg border border-slate-800/60 gap-1 z-50">
            {menuItems.map((item) => {
              const isSelected = activeTab === item.id;
              return (
                <button
                  id={`tab-desktop-${item.id}`}
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 md:px-4 py-1.5 rounded-md text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1.5 select-none ${
                    isSelected 
                      ? "bg-emerald-500 text-slate-950 shadow-md" 
                      : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono tracking-widest py-1 px-2.5 text-emerald-400 bg-emerald-500/10 rounded border border-emerald-500/15 animate-pulse">
            SISTEMA PROFISSIONAL
          </span>
        </div>
      </div>

      {/* Main Dynamic Screen viewport Wrapper (Adaptive Grid Frame with no dual scrolling) */}
      <div className="flex-1 overflow-hidden flex flex-col w-full relative bg-slate-900">
        <div className="flex-1 flex flex-col w-full max-w-6xl mx-auto md:px-4 lg:px-6 relative overflow-hidden bg-slate-900 md:border-x md:border-slate-950">
          <div className="flex-1 flex flex-col overflow-hidden relative bg-slate-900 h-full">
            {children}
          </div>
        </div>
      </div>

      {/* Bottom Navigation Menu specifically for Mobile Layouts */}
      {!hideNavigation && (
        <div className="sm:hidden h-16 bg-slate-950 border-t border-slate-900 px-4 flex items-center justify-around pb-1.5 shrink-0 z-40">
          {menuItems.map((item) => {
            const isSelected = activeTab === item.id;
            return (
              <button
                id={`menu-btn-mobile-${item.id}`}
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center justify-center gap-1 cursor-pointer group flex-1 py-1"
              >
                <div className={`transition-all duration-300 ${isSelected ? "scale-110 text-emerald-400" : "text-slate-400 opacity-60 group-hover:opacity-100"}`}>
                  {item.icon}
                </div>
                <span className={`text-[9px] font-bold transition-all ${isSelected ? "text-emerald-400" : "text-slate-500"}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
