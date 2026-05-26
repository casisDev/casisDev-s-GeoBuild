import React, { useRef, useState, useEffect } from "react";
import { Camera, RefreshCw, Zap, Check, AlertTriangle, Play, Pause, Power, Image as ImageIcon, Sparkles } from "lucide-react";

interface TerrainCameraCaptureProps {
  onCapture: (base64: string) => void;
  isLoading: boolean;
}

export default function TerrainCameraCapture({ onCapture, isLoading }: TerrainCameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [guideOverlay, setGuideOverlay] = useState<boolean>(true);

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    setCameraError(null);
    setCapturedImage(null);
    try {
      // Prioritize environment camera for taking pictures of the scenery / land
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch (error: any) {
      console.error("Erro ao acessar câmera real:", error);
      let errorMessage = "Não foi possível acessar a câmera. ";
      if (error.name === "NotAllowedError") {
        errorMessage += "Verifique se concedeu permissão de uso da câmera no navegador.";
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        errorMessage += "Nenhuma câmera física detectada no dispositivo atual.";
      } else {
        errorMessage += error.message || "";
      }
      errorMessage += " Se você estiver visualizando dentro do iframe incorporado do AI Studio, experimente clicar em 'Abrir em nova aba' no canto superior direito para liberar o hardware.";
      setCameraError(errorMessage);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const toggleFacingMode = () => {
    stopCamera();
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    // Re-trigger start after state switch
    setTimeout(() => {
      startCamera();
    }, 200);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        // Match high resolution camera pixels
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        // Mirror the canvas if using the front/user camera
        context.save();
        if (facingMode === "user") {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        context.restore();

        const base64Image = canvas.toDataURL("image/jpeg", 0.85);
        setCapturedImage(base64Image);
        stopCamera();
      }
    }
  };

  const handleSendToAnalysis = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Automated Mock terrain visualizer capture if the user doesn't have a camera or is on desktop
  const triggerMockDeviceCapture = () => {
    // Simulates an expert land photo
    const mockTerrains = [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=700&auto=format&fit=crop", // Grass field
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=700&auto=format&fit=crop", // Dense forest view
      "https://images.unsplash.com/photo-1504150559411-255ab7264579?q=80&w=700&auto=format&fit=crop", // Clay field
    ];
    const pickedUrl = mockTerrains[Math.floor(Math.random() * mockTerrains.length)];
    
    setCameraError(null);
    
    // We fetch and convert standard visual unsplash placeholder of a land to base64 securely so the API treats it like a native snapshot!
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataURL);
      }
    };
    img.onerror = () => {
      // Fallback fallback base64 representation
      setCapturedImage("data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=");
    };
    img.src = pickedUrl;
  };

  return (
    <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 shrink-0 flex flex-col gap-4">
      <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">
            Capturar Foto In-Situ (Câmera)
          </span>
        </div>
        
        {isCameraActive && (
          <button
            onClick={toggleFacingMode}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all"
            title="Alternar Câmera Frontal/Traseira"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Camera Live stream or Snap Preview */}
      <div className="relative w-full aspect-video md:aspect-[4/3] bg-black rounded-xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center">
        
        {cameraError && !capturedImage && !isCameraActive && (
          <div className="p-4 text-center max-w-[280px]">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <h5 className="text-xs font-semibold text-slate-200">Restrição de Câmera ou Iframe</h5>
            <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
              O navegador barrou o acesso à câmera física (comum em visões iframe sem permissão HTTPS).
            </p>
            <div className="flex flex-col gap-2 mt-3">
              <button
                onClick={startCamera}
                className="w-full px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold cursor-pointer transition-all"
              >
                Tentar Câmera Novamente
              </button>
              <button
                onClick={triggerMockDeviceCapture}
                className="w-full px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded text-[10px] font-bold cursor-pointer transition-all border border-slate-700"
              >
                Gerar Foto Realista via Simulador
              </button>
            </div>
          </div>
        )}

        {/* Real Live active video feed */}
        {isCameraActive && !capturedImage && (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
            />
            
            {/* Compass overlay guide */}
            {guideOverlay && (
              <div className="absolute inset-0 border-[2px] border-emerald-500/20 m-6 rounded flex flex-col justify-between pointer-events-none p-2 animate-pulse">
                <div className="flex justify-between text-[8px] font-mono text-emerald-400">
                  <span>HÍBRIDO_GUIDE_GRID_Z4</span>
                  <span>HORIZONTE_ALINHADO</span>
                </div>
                {/* Visual horizontal guide center line */}
                <div className="w-full border-t border-dashed border-emerald-500/35"></div>
                <div className="flex justify-between text-[8px] font-mono text-emerald-400">
                  <span>RAMPA EXPONTÂNEA %</span>
                  <span>CV_GEOPROC_MODE</span>
                </div>
              </div>
            )}
            
            {/* Status scanner floating effect line */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-400/80 shadow-[0_0_10px_#10b981] animate-scan-line pointer-events-none"></div>
          </div>
        )}

        {/* Snap Captured Still Image Preview */}
        {capturedImage && (
          <div className="relative w-full h-full">
            <img src={capturedImage} alt="Terreno Capturado" className="w-full h-full object-cover" />
            <div className="absolute bottom-2 left-2 bg-emerald-500 text-slate-950 font-mono font-bold text-[9px] px-2 py-0.5 rounded-md flex items-center gap-1">
              <Check className="h-3 w-3" />
              <span>CAPTURADA COM SUCESSO</span>
            </div>
          </div>
        )}

        {/* Initial camera off invitation stage */}
        {!isCameraActive && !capturedImage && !cameraError && (
          <div className="text-center p-6 flex flex-col items-center gap-2">
            <div className="bg-slate-900 p-3 rounded-full border border-slate-800">
              <Camera className="h-6 w-6 text-slate-400" />
            </div>
            <h5 className="text-xs font-bold text-slate-200">Câmera Não Iniciada</h5>
            <p className="text-[10px] text-slate-500 max-w-[220px] leading-relaxed">
              Inicie a câmera para enquadrar o lote diretamente com o celular para cálculo de viabilidade integrada.
            </p>
            <button
              onClick={startCamera}
              className="mt-2 text-xs font-semibold px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Power className="h-3.5 w-3.5" />
              <span>Ligar Câmera</span>
            </button>
          </div>
        )}

        {/* Hidden internal canvas layout */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Control Buttons row layout */}
      <div className="flex gap-2">
        {isCameraActive && !capturedImage && (
          <>
            <button
              onClick={capturePhoto}
              className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Camera className="h-4 w-4" />
              <span>Capturar Foto</span>
            </button>
            <button
              onClick={stopCamera}
              className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Parar
            </button>
          </>
        )}

        {capturedImage && (
          <>
            <button
              onClick={handleSendToAnalysis}
              disabled={isLoading}
              className={`flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-xl active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Sparkles className="h-4 w-4 text-emerald-950 animate-pulse" />
              <span>{isLoading ? "Processando IA..." : "Enviar para Análise Civil"}</span>
            </button>
            <button
              onClick={handleRetake}
              disabled={isLoading}
              className="px-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Repetir Foto
            </button>
          </>
        )}
      </div>

      {/* Toggle visual guides button */}
      {isCameraActive && !capturedImage && (
        <button
          onClick={() => setGuideOverlay(!guideOverlay)}
          className="text-right text-[10px] text-slate-500 hover:text-slate-300 transition-all font-mono underline"
        >
          {guideOverlay ? "Ocultar grelhas de enquadramento" : "Mostrar grelhas de enquadramento"}
        </button>
      )}
    </div>
  );
}
