import { TerrainAnalysisReport } from "../types";

export const MOCK_REPORTS_LOCAL: Record<string, TerrainAnalysisReport> = {
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

/**
 * Generates a realistic dynamic simulation when analyzing custom-uploaded images in client-only environments (Netlify).
 */
export function getFallbackAnalysis(sampleId?: string): TerrainAnalysisReport {
  if (sampleId && MOCK_REPORTS_LOCAL[sampleId]) {
    return { ...MOCK_REPORTS_LOCAL[sampleId] };
  }

  // Generate a customized random dynamic report for user custom uploaded photographs
  const randomIndex = Math.floor(Math.random() * 3);
  const baseKey = ["flat_sandy", "dense_forest", "steep_hillside"][randomIndex];
  const baseReport = MOCK_REPORTS_LOCAL[baseKey];

  return {
    ...baseReport,
    title: `Foto Privada Enviada (Simulação Local Netlify/Static)`,
    detailedAnalysis: `[CLIENT-SIDE SIMULATOR]: ${baseReport.detailedAnalysis} (Relatório gerado em ambiente de execução cliente puramente estático).`
  };
}

/**
 * Returns a conversational smart engineering response from Eng. Lucas locally
 */
export function getFallbackChatResponse(query: string, currentReport: TerrainAnalysisReport | null): string {
  const qStr = query.toLowerCase();
  
  // Base details of the current active terrain report
  const title = currentReport ? currentReport.title : "Terreno não selecionado";
  const foundation = currentReport ? currentReport.structuralSuggestions.recommendedFoundation : "Sapatas ou Estacas";
  const slope = currentReport ? currentReport.metrics.slope : 5;
  const soil = currentReport ? currentReport.metrics.soilTypeEstimate : "solo geral";

  if (qStr.includes("funda") || qStr.includes("sapata") || qStr.includes("radier") || qStr.includes("estaca")) {
    return `**Eng. Lucas (Mentor IA Offline):** No lote ativo **${title}**, a minha principal indicação técnica de fundação é de fato o método **${foundation}**. 

Para solos com perfil ${soil}, as cargas precisam ser direcionadas à camada resistente. Se você quiser reduzir riscos estruturais contra trincas e recalque diferencial das paredes externas, invista sempre na aplicação correta de uma boa viga de baldrame impermeabilizada com emulsão asfáltica.`;
  }

  if (qStr.includes("terraplenagem") || qStr.includes("corte") || qStr.includes("aterro") || qStr.includes("decliv") || qStr.includes("nivelar")) {
    return `**Eng. Lucas (Mentor IA Offline):** Com uma declividade média de **${slope}%**, a movimentação de terra requer cuidados específicos. 

Se passarmos de 10% de inclinação, lembre-se de que os taludes de corte devem respeitar a proporção 1:1 para evitar escorregamentos superficiais de terra. Recomendo planejar canaletas de drenagem no topo e base do talude para gerenciar o escoamento rápido de águas pluviais de forma segura.`;
  }

  if (qStr.includes("licen") || qStr.includes("urban") || qStr.includes("restri") || qStr.includes("lei") || qStr.includes("prefeitura") || qStr.includes("norma")) {
    const risk = currentReport ? currentReport.structuralSuggestions.zoningRisk : "Se liga nos recuos mínimos das divisas laterais.";
    return `**Eng. Lucas (Mentor IA Offline):** O planejamento legal urbano da área aponta:
    
- **Restrição:** *${risk}*

Antes de assinar qualquer contrato civil ou mobilizar maquinários ao local, faça uma consulta na prefeitura do município para emitir a 'Certidão de Diretrizes de Uso do Solo'. Evite dores de cabeça com multas administrativas ou embargo ambiental de obra!`;
  }

  if (qStr.includes("sondagem") || qStr.includes("spt") || qStr.includes("furo") || qStr.includes("ensaio")) {
    return `**Eng. Lucas (Mentor IA Offline):** Uma excelente dúvida! O ensaio de penetração padrão (sondagem SPT) é o exame de sangue de qualquer cálculo civil estrutural sério!
    
Eu recomendo fortemente projetar no mínimo **3 furos de sondagem locados em triângulo** no perímetro principal da futura construção. Isso nos dá a tensão admissível exata à temperatura e nível das águas a cada metro, além de certificar a espessura da camada de argila ou areia. Sem isso, estamos apenas adivinhando a capacidade do subsolo!`;
  }

  if (qStr.includes("custo") || qStr.includes("preço") || qStr.includes("gastar") || qStr.includes("orçament")) {
    const cost = currentReport ? currentReport.costEstimations.foundationFactor : "Moderado";
    const prep = currentReport ? currentReport.costEstimations.sitePreparationCost : "Padrão";
    return `**Eng. Lucas (Mentor IA Offline):** Falando sobre valores de implantação, estimo que o fator de custos para as fundações seja classificado como **${cost}**, com um custo de preparação física inicial do terreno do tipo **${prep}**.
    
Geralmente, focar em limpezas e nivelamento bem executado de platôs reduz custos adicionais surpreendentes durante a etapa civil pesada da obra. Reduza perdas fazendo a dosagem do concreto sob especificação correta FCK compatível.`;
  }

  // General default answer
  return `**Eng. Lucas (Mentor IA Offline):** Olá! Como engenheiro civil mentor deste sistema, analisei sua pergunta sobre o lote **${title}** (Solo: *${soil}* com declive de *${slope}%*).

Para dimensionamento estrutural refinado, recomendo que consideremos também o tipo recomendado de fundação (**${foundation}**) e façamos o isolamento hidráulico das sapatas. Do que mais você precisa saber (como furos SPT, licenças urbanas ou movimentações de terra e taludes)?`;
}
