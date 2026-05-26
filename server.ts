import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limits for base64 image uploads
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Initialize Gemini SDK lazily to avoid startup crashes if key is omitted initially
let aiInstance: GoogleGenAI | null = null;
function getGeminiSDK(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARN: GEMINI_API_KEY environment variable is not set. Using fallback mock mode.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// In-memory store for the last analyzed terrain report to feed into the conversational chat
let lastAnalyzedReport: any = null;

// Mock terrain analysis data in case GEMINI_API_KEY is not available or is a draft placeholder
const MOCK_REPORTS: Record<string, any> = {
  flat_sandy: {
    success: true,
    title: "Terreno Plano e Arenoso (Litoral/Planície)",
    score: 88,
    classification: "Altamente Viável",
    metrics: {
      slope: 2,
      vegetationDensity: "Baixa",
      soilTypeEstimate: "Arenoso com pouca coesão",
      accessibility: "Excelente",
      waterDrainageRate: "Boa"
    },
    structuralSuggestions: {
      recommendedFoundation: "Radier ou Sapatas Corridas",
      foundationExplanation: "Devido à baixa coesão do solo arenoso, uma fundação superficial do tipo Radier distribui uniformemente as cargas da superestrutura de forma muito econômica para habitações de baixo porte. Para cargas maiores, sapatas profundas ou estacas curtas podem ser necessárias.",
      earthworksComplexity: "Baixo",
      earthworksExplanation: "Declividade de apenas 2%. Necessita apenas de limpeza básica da camada superficial de solo orgânico e nivelamento simples.",
      zoningRisk: "Zona Urbana Consolidada. Sem restrições ambientais críticas. Recuo obrigatório padrão de 5 metros."
    },
    environmentalImpact: {
      riskLevel: "Baixo",
      defestationRequired: false,
      licensingDifficulty: "Fácil"
    },
    costEstimations: {
      foundationFactor: "Econômico",
      sitePreparationCost: "Baixo"
    },
    detailedAnalysis: "Este lote apresenta ótimas condições gerais para construção imediata. A topografia praticamente plana elimina a necessidade de cortes e aterros expressivos. O principal ponto de atenção técnica é o solo arenoso, que exige impermeabilização adequada no arranque das fundações e sapatas para evitar recalques diferenciais se exposto a variações freáticas. A excelente acessibilidade facilita a logística de caminhões de concreto e maquinário pesado."
  },
  steep_hillside: {
    success: true,
    title: "Encosta Íngreme com Rochas Expostas",
    score: 42,
    classification: "Baixa Viabilidade",
    metrics: {
      slope: 28,
      vegetationDensity: "Média",
      soilTypeEstimate: "Gnaisse/Rochoso com cobertura de solo residual",
      accessibility: "Limitada",
      waterDrainageRate: "Boa"
    },
    structuralSuggestions: {
      recommendedFoundation: "Estacas Escavadas em Rocha ou Tubulões com arrimo",
      foundationExplanation: "A alta inclinação e presença de rocha pedem ancoragem profunda para evitar deslizamento de talude. Sapatas convencionais não são viáveis sem grandes estruturas de contenção (Muros de Arrimo).",
      earthworksComplexity: "Alto",
      earthworksExplanation: "Declividade crítica de 28%. Exige contenção robusta (cortinas atirantadas de solo grampeado ou muros gravidade), além de provável detonação/rompimento mecânico de matacões.",
      zoningRisk: "Área de Preservação Permanente (APP) parcial de encosta. Necessita de outorga especial e laudo geológico rigoroso."
    },
    environmentalImpact: {
      riskLevel: "Alto",
      defestationRequired: true,
      licensingDifficulty: "Complexo"
    },
    costEstimations: {
      foundationFactor: "Muito Elevado",
      sitePreparationCost: "Muito Alto"
    },
    detailedAnalysis: "Terreno desafiador caracterizado por forte declividade de encosta montanhosa. Apresenta excelente resistência portante nas profundidades rochosas, porém o custo de implantação civil será acentuado devido à terraplanagem e aos muros de contenção exigidos para criar platôs estáveis. Recomendado realizar sondagem de solo (SPT) prioritariamente para traçar o perfil exato do substrato rochoso."
  },
  dense_forest: {
    success: true,
    title: "Lote de Mata Nativa (Solo Argiloso)",
    score: 58,
    classification: "Viabilidade Moderada",
    metrics: {
      slope: 8,
      vegetationDensity: "Alta",
      soilTypeEstimate: "Argiloso Orgânico / Latossolo Vermelho",
      accessibility: "Boa",
      waterDrainageRate: "Regular"
    },
    structuralSuggestions: {
      recommendedFoundation: "Sapatas Isoladas ou Estacas tipo Broca",
      foundationExplanation: "Solo argiloso com boa resistência a partir de 1.5 metros de profundidade. Sapatas profundas ou estacas de concreto armado evitam as camadas superficiais instáveis e ricas em matéria orgânica proveniente da decomposição das folhas.",
      earthworksComplexity: "Médio",
      earthworksExplanation: "Declive moderado de 8%. Requer terraplanagem intermediária com pequenos taludes de compensação em corte/aterro.",
      zoningRisk: "Necessário obter licença prévia de supressão de vegetação com compensação ambiental florestal na prefeitura ou órgão estadual."
    },
    environmentalImpact: {
      riskLevel: "Moderado",
      defestationRequired: true,
      licensingDifficulty: "Moderado"
    },
    costEstimations: {
      foundationFactor: "Padrão",
      sitePreparationCost: "Médio"
    },
    detailedAnalysis: "Solo argilo-silicoso com presença de raízes profundas que requerem destocamento completo durante a preparação da área útil. A taxa de infiltração é regular, sugerindo cuidados adicionais na drenagem de águas pluviais para evitar encharcamento da base estrutural. O licenciamento ambiental para desmatamento parcial é o principal limitador cronológico da obra."
  },
  urban_concrete: {
    success: true,
    title: "Lote Urbano Consolidado (Entre Edificações)",
    score: 78,
    classification: "Viabilidade Moderada",
    metrics: {
      slope: 3,
      vegetationDensity: "Nenhuma",
      soilTypeEstimate: "Aterro antrópico superficial sobre solo silto-argiloso",
      accessibility: "Excelente",
      waterDrainageRate: "Boa"
    },
    structuralSuggestions: {
      recommendedFoundation: "Estacas Hélice Contínua ou Estacas de Reação",
      foundationExplanation: "A proximidade imediata dos edifícios vizinhos proíbe fundações que gerem forte vibração (como bate-estacas de gravidade) para evitar trincas na vizinhança. Métodos escavados ou prensados são obrigatórios.",
      earthworksComplexity: "Baixo",
      earthworksExplanation: "Terreno plano sem necessidade de grandes desníveis. O cuidado recai estritamente no escoramento seguro das divisas vizinhas durante escavações de subsolo.",
      zoningRisk: "Em conformidade com plano diretor local. Restrições severas de horários para tráfego de caminhões betoneira e ruídos."
    },
    environmentalImpact: {
      riskLevel: "Baixo",
      defestationRequired: false,
      licensingDifficulty: "Fácil"
    },
    costEstimations: {
      foundationFactor: "Oneroso",
      sitePreparationCost: "Baixo"
    },
    detailedAnalysis: "Excelente inserção de infraestrutura (redes de água, esgoto, energia e fibra óptica já disponíveis na calçada). A implantação estrutural é altamente viável, porém o orçamento das fundações é encarecido pelo cuidado indispensável nas divisas para proteger as estruturas limítrofes já consolidadas."
  }
};

// POST fallback or genuine evaluation
app.post("/api/analyze-terrain", async (req, res) => {
  const { imageBase64, sampleId } = req.body;

  try {
    // Check if user requests a standard sample and we fallback, or if they loaded a custom base64 image
    if (sampleId && MOCK_REPORTS[sampleId] && !imageBase64) {
      console.log(`Analyzing preloaded terrain sample: ${sampleId}`);
      // Simulate slight processing variation
      const report = { ...MOCK_REPORTS[sampleId] };
      lastAnalyzedReport = report;
      return res.json(report);
    }

    if (!imageBase64) {
      return res.status(400).json({ error: "Nenhuma imagem ou identificador de terreno enviado." });
    }

    // Attempt real Gemini API integration if credentials exist
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.log("No valid API key. Serving realistic fallback generated data based on approximate profile");
      // Pick flat_sandy, urban_concrete, or a generated default
      const defaultReport = { ...MOCK_REPORTS.flat_sandy, title: "Imagem Enviada (Avaliação Simulada Sem API Key)" };
      lastAnalyzedReport = defaultReport;
      return res.json(defaultReport);
    }

    // Call actual Gemini API with base64 analysis
    const ai = getGeminiSDK();
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `
      Você é um Engenheiro Civil especialista em Geotecnia, Topografia e Análise Estrutural. 
      Analise cuidadosamente a imagem deste terreno para gerar um relatório de viabilidade técnico-civil detalhado.
      Extraia informações visuais como inclinação estimada (talude, aclive, declive), densidade de vegetação (árvores nativas que exigem supressão licitada), se há rochas expostas ou indícios de solo firme/molhado, facilidade de acesso de máquinas e fiação ou infraestrutura próxima.
      
      Retorne obrigatoriamente um objeto em formato JSON estrito, conforme a estrutura solicitada. Forneça estimativas de engenharia civil baseadas na imagem.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: cleanBase64
          }
        },
        { text: prompt }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["success", "score", "title", "classification", "metrics", "structuralSuggestions", "environmentalImpact", "costEstimations", "detailedAnalysis"],
          properties: {
            success: { type: Type.BOOLEAN, description: "Deve ser true sempre." },
            score: { type: Type.INTEGER, description: "Pontuação de viabilidade construtiva de 0 a 100 com base em facilidade construtiva." },
            title: { type: Type.STRING, description: "Título descritivo rápido para este lote." },
            classification: { 
              type: Type.STRING, 
              enum: ["Altamente Viável", "Viabilidade Moderada", "Baixa Viabilidade", "Inviável temporariamente"] 
            },
            metrics: {
              type: Type.OBJECT,
              required: ["slope", "vegetationDensity", "soilTypeEstimate", "accessibility", "waterDrainageRate"],
              properties: {
                slope: { type: Type.INTEGER, description: "Aclive ou declive máximo estimado em porcentagem (ex: 5, 12, 35)." },
                vegetationDensity: { type: Type.STRING, enum: ["Nenhuma", "Baixa", "Média", "Alta", "Área de Preservação"] },
                soilTypeEstimate: { type: Type.STRING, description: "Breve palpite do tipo e classe do solo visível (ex: argiloso vermelho, arenoso costeiro, rochoso alterado)." },
                accessibility: { type: Type.STRING, enum: ["Excelente", "Boa", "Limitada", "Difícil"] },
                waterDrainageRate: { type: Type.STRING, enum: ["Boa", "Regular", "Pobre / Encharcado"] }
              }
            },
            structuralSuggestions: {
              type: Type.OBJECT,
              required: ["recommendedFoundation", "foundationExplanation", "earthworksComplexity", "earthworksExplanation", "zoningRisk"],
              properties: {
                recommendedFoundation: { type: Type.STRING, description: "Nome técnico do tipo mais econômico sugerido de fundação (ex: Sapata Isolada, Estaca Broca, Viga Baldrame, Radier em concreto armado, Estacas Strauss)." },
                foundationExplanation: { type: Type.STRING, description: "Justificativa técnica detalhada para a escolha da fundação." },
                earthworksComplexity: { type: Type.STRING, enum: ["Baixo", "Médio", "Alto"] },
                earthworksExplanation: { type: Type.STRING, description: "Explicação técnica sobre corte, aterro, nivelamento e movimentação de terra requerida." },
                zoningRisk: { type: Type.STRING, description: "Apontamento doutrinário ou legal de restrições (ex: faixa de domínio, APP de córrego, código de obras local)." }
              }
            },
            environmentalImpact: {
              type: Type.OBJECT,
              required: ["riskLevel", "defestationRequired", "licensingDifficulty"],
              properties: {
                riskLevel: { type: Type.STRING, enum: ["Baixo", "Moderado", "Alto", "Crítico"] },
                defestationRequired: { type: Type.BOOLEAN, description: "Se necessita de desmatamento/limpeza de árvores nativas robustas." },
                licensingDifficulty: { type: Type.STRING, enum: ["Fácil", "Moderado", "Complexo"] }
              }
            },
            costEstimations: {
              type: Type.OBJECT,
              required: ["foundationFactor", "sitePreparationCost"],
              properties: {
                foundationFactor: { type: Type.STRING, enum: ["Econômico", "Padrão", "Oneroso", "Muito Elevado"] },
                sitePreparationCost: { type: Type.STRING, description: "Breve estimativa de custos de terraplanagem (ex: Baixo, Intermediário, Elevado devido a taludes, etc.)" }
              }
            },
            detailedAnalysis: { type: Type.STRING, description: "Uma redação profissional de 4 a 6 linhas dando o veredito geral da imagem do ponto de vista da engenharia." }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    lastAnalyzedReport = parsedData;
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini analysis error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Ocorreu um erro ao processar a inteligência artificial na imagem: " + error.message,
      // Fallback response for continuity
      ...MOCK_REPORTS.flat_sandy
    });
  }
});

// Chat follow up about the analyzed terrain
app.post("/api/chat-terrain", async (req, res) => {
  const { message, chatHistory } = req.body;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      // Return a simulated, helpful responses from Eng. Lucas
      const mockAnswers: string[] = [
        "Com base no relatório ativo, recomendo fortemente que façamos uma sondagem de solo (percussão SPT) com pelo menos 3 furos de amostragem. Isso nos dará a resistência exata do solo (NSPT) a cada metro para dimensionar a fundação sem riscos de recalque excessivo.",
        "Em relação aos cortes de terraplanagem, a inclinação exige que façamos taludes de corte com proporção de 1:1, ou projetar um muro de contenção robusto, como blocos de arrimo com drenos barbacãs para evitar acúmulo de pressão hidrostática.",
        "O licenciamento ambiental dependerá da classificação junto à Secretaria de Urbanismo. Como identificamos vegetação média, a limpeza do lote pode exigir um Plano de Compensação com plantio de mudas nativas em área equivalente das redondezas.",
        "Para esse tipo de fundação (como sapata ou radier), é fundamental aplicar duas demãos de emulsão asfáltica impermeabilizante no baldrame para evitar a capilaridade da umidade ascendente que estraga as paredes futuramente."
      ];
      const randomAnswer = mockAnswers[Math.floor(Math.random() * mockAnswers.length)];
      return res.json({ 
        success: true, 
        reply: `**(Modo Simulado) Eng. Lucas:** ${randomAnswer}\n\n*Nota: Conecte sua GEMINI_API_KEY oficial no painel do AI Studio para análise 100% personalizada em tempo real.*` 
      });
    }

    const ai = getGeminiSDK();

    // Prepare context using lastAnalyzedReport
    const contextStr = lastAnalyzedReport 
      ? `Relatório Técnico Atual do Terreno de Título "${lastAnalyzedReport.title}":
         - Viabilidade: ${lastAnalyzedReport.classification} (${lastAnalyzedReport.score}/100)
         - Inclinação: ${lastAnalyzedReport.metrics.slope}%
         - Tipo de Solo: ${lastAnalyzedReport.metrics.soilTypeEstimate}
         - Fundação Sugerida: ${lastAnalyzedReport.structuralSuggestions?.recommendedFoundation}
         - Complexidade Terraplanagem: ${lastAnalyzedReport.structuralSuggestions?.earthworksComplexity}
         - Resumo Geral: ${lastAnalyzedReport.detailedAnalysis}`
      : "Ainda não analisamos nenhum terreno específico nesta sessão do app.";

    const systemPrompt = `
      Você é o Engenheiro Civil Lucas, um mentor sênior de Geotecnia e Construção Civil extremamente experiente e amigável.
      Seu objetivo é instruir e responder perguntas de desenvolvedores imobiliários, engenheiros júniors e arquitetos que pretendem planejar uma construção.
      
      Aqui está o contexto técnico do lote que está sendo visualizado na tela:
      ---
      ${contextStr}
      ---
      
      Instruções para falar:
      - Fale sempre em português (Brasil).
      - Mantenha respostas profissionais de engenharia civil aplicadas, práticas e muito diretas.
      - Evite termos de consultoria abstratos e use recomendações diretas sobre drenagem, arrimos, geotecnia e cálculo estrutural simples.
      - Quando apropriado, sugira que façam sondagem SPT (Ensaio de Penetração Padrão).
    `;

    // Package standard formats
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    // Make chatbot call
    const response = await chat.sendMessage({ message: message });
    res.json({ success: true, reply: response.text });

  } catch (error: any) {
    console.error("Gemini chat error:", error);
    res.status(500).json({ success: false, error: "Erro no assistente virtual: " + error.message });
  }
});

// Setup development or production environment
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted in Development mode.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static production assets from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
