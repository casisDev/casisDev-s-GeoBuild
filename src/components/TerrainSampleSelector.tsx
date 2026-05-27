import React, { useRef, useState } from "react";
import { Upload, Camera, FileText, CheckCircle, Image as ImageIcon, AlertCircle, Sun, Mountain, TreePine, Building2, Lightbulb } from "lucide-react";

interface TerrainSampleSelectorProps {
  onSelectSample: (id: string) => void;
  onUploadImage: (base64: string) => void;
  selectedId: string | null;
  isLoading: boolean;
}

export default function TerrainSampleSelector({
  onSelectSample,
  onUploadImage,
  selectedId,
  isLoading
}: TerrainSampleSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const samples = [
    {
      id: "flat_sandy",
      name: "Plano Arenoso",
      desc: "Lote limpo e regular de planície",
      tag: "Aridez / Litoral",
      bgColor: "from-amber-700 to-yellow-600"
    },
    {
      id: "steep_hillside",
      name: "Encosta Rochosa",
      desc: "Declividade acentuada com matacões",
      tag: "Geotecnia Complexa",
      bgColor: "from-rose-900 to-slate-700"
    },
    {
      id: "dense_forest",
      name: "Mata Atlântica",
      desc: "Vegetação nativa com solo argiloso",
      tag: "Zonamento Florestal",
      bgColor: "from-emerald-900 to-teal-800"
    },
    {
      id: "urban_concrete",
      name: "Caixa Urbana",
      desc: "Lote confinado entre prédios",
      tag: "Infraestrutura Local",
      bgColor: "from-blue-900 to-slate-800"
    }
  ];

  const renderSampleIcon = (id: string) => {
    switch (id) {
      case "flat_sandy":
        return <Sun className="h-7 w-7 text-amber-400" />;
      case "steep_hillside":
        return <Mountain className="h-7 w-7 text-rose-400" />;
      case "dense_forest":
        return <TreePine className="h-7 w-7 text-emerald-400" />;
      case "urban_concrete":
        return <Building2 className="h-7 w-7 text-blue-400" />;
      default:
        return <ImageIcon className="h-7 w-7 text-slate-400" />;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setErrorMsg("");
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Por favor, envie apenas arquivos de imagem comuns (JPEG, PNG).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg("Imagem muito grande. Limite de tamanho: 15MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onUploadImage(event.target.result as string);
      }
    };
    reader.onerror = () => {
      setErrorMsg("Falha ao ler o arquivo de terreno.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      
      {/* Dynamic scan alert/cue */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800 rounded-2xl p-4">
        <h3 className="text-xs font-mono font-medium tracking-widest text-emerald-400 uppercase flex items-center gap-2">
          <Camera className="h-3.5 w-3.5" />
          Módulo de Visão Computacional
        </h3>
        <p className="text-slate-300 text-xs mt-2 leading-relaxed">
          Selecione um lote modelo ou faça upload de uma foto real do terreno para a inteligência artificial realizar o mapeamento civil preliminar.
        </p>
      </div>

      {/* Grid selector - Terrenos Preset */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 font-display tracking-wider uppercase mb-3">
          1. Terrenos de Amostragem (Modelos)
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {samples.map((sample) => {
            const isActive = selectedId === sample.id;
            return (
              <button
                id={`sample-card-${sample.id}`}
                key={sample.id}
                onClick={() => !isLoading && onSelectSample(sample.id)}
                disabled={isLoading}
                className={`relative overflow-hidden text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-40 ${
                  isActive
                    ? "border-emerald-500 bg-slate-800 shadow-lg ring-2 ring-emerald-500/20"
                    : "border-slate-800 bg-slate-950 hover:bg-slate-900/60"
                } ${isLoading ? "opacity-60 cursor-not-allowed" : "active:scale-95"}`}
              >
                {/* Visual Background Accent Color bubble */}
                <div className={`absolute -right-4 -bottom-4 w-20 h-20 bg-gradient-to-br ${sample.bgColor} rounded-full filter blur-xl opacity-30`}></div>
                
                <div className="flex justify-between items-start">
                  <span className="text-3xl filter drop-shadow">
                    {renderSampleIcon(sample.id)}
                  </span>
                  <span className="text-[9px] bg-slate-900/90 text-slate-300 rounded-full px-2 py-0.5 font-mono">
                    {sample.tag}
                  </span>
                </div>

                <div className="mt-3 relative z-10">
                  <h5 className="text-[13px] font-bold font-display text-white">{sample.name}</h5>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-normal">{sample.desc}</p>
                </div>

                {isActive && (
                  <div className="absolute top-2 right-2 text-emerald-400">
                    <CheckCircle className="h-4.5 w-4.5 fill-slate-950" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload/Camera Module Component */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 font-display tracking-wider uppercase mb-3">
          2. Fotografar ou Carregar Própria Imagem
        </h4>

        <div
          id="file-dropzone"
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isLoading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
            dragActive
              ? "border-emerald-500 bg-emerald-500/5"
              : "border-slate-800 bg-slate-950 hover:border-slate-700"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-900/40"}`}
        >
          <input
            id="file-upload-input"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isLoading}
          />

          <div className="bg-slate-900 p-2.5 rounded-full border border-slate-800 text-indigo-400">
            <Upload className="h-5 w-5 animate-bounce" />
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-100 block">
              Tirar Foto do Lote ou Enviar arquivo
            </span>
            <span className="text-[9px] text-slate-500 block mt-1">
              Arraste a foto ou clique para simular câmera / galeria
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-800/40 px-2 py-1 rounded">
            <span className="text-[9px] text-slate-400 font-mono">AR / Visão Híbrida Ativada</span>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 mt-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 p-2.5 rounded-lg text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Informative bottom card about requirements */}
      <div className="border border-slate-800 bg-slate-950/40 rounded-xl p-3 flex gap-2.5 items-start">
        <div className="bg-emerald-500/10 p-1.5 rounded text-emerald-400 shrink-0">
          <Lightbulb className="h-4 w-4" />
        </div>
        <div className="text-[11px] leading-relaxed text-slate-400">
          <strong className="text-slate-300">Dica Geotécnica:</strong> Tire fotos de encostas que mostram o lote em perfil (com referências de árvores, postes ou casas vizinhas) para que a IA possa estimar a rampa média do plano cartesiano.
        </div>
      </div>

    </div>
  );
}
