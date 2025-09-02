// Serviço para integração com o backend FastAPI corrigido
import { fileToDataURL } from '../utils/toDataURL';

// Configuração da API base URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export interface TickrifyAnalysisRequest {
  data_url?: string;
  image_base64?: string;
  mime?: string;
}

// Resposta completa do backend (JSON Schema que definimos)
export interface TickrifyBackendResponse {
  analise_metadata: {
    qualidade_imagem: string;
    simbolo_detectado: string;
    timeframe_detectado: string;
  };
  estrutura_mercado: {
    tendencia_primaria: string;
    tendencia_secundaria: string;
    descricao_contexto: string;
    suportes_visiveis: string[];
    resistencias_visiveis: string[];
  };
  sinais_tecnicos: {
    diagnostico_clareza: string;
    padrao_candlestick: {
      nome: string;
      interpretacao: string;
    };
    indicadores_visiveis: Array<{
      nome: string;
      sinal: string;
    }>;
  };
  decisao_analista: {
    recomendacao: string;
    qualidade_oportunidade: string;
    justificativa_confluencia: string;
    fatores_convergentes: string[];
    fatores_divergentes: string[];
  };
  gestao_risco_sugerida: {
    preco_entrada: string;
    stop_loss: string;
    take_profit: string;
  };
  market_snapshot: {
    simbolo_mercado?: string;
    preco_atual: string;
    variacao_24h: string;
    variacao_percentual?: string;
    maxima_24h: string;
    minima_24h: string;
    volume_24h: string;
    tendencia_atual?: string;
    forca_tendencia?: string;
    indicadores_resumo: string[];
    confluencias_tecnicas?: string[];
    resumo_rapido: string;
  };
  alerta_limitacoes: string;
}

// Interface simplificada para o frontend
export interface TickrifyAnalysisResponse {
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  rationale: string;
  key_levels?: number[];
  timeframe?: string;
  market_snapshot?: {
    simbolo_mercado?: string;
    preco_atual: string;
    variacao_24h: string;
    variacao_percentual?: string;
    maxima_24h: string;
    minima_24h: string;
    volume_24h: string;
    tendencia_atual?: string;
    forca_tendencia?: string;
    indicadores_resumo: string[];
    confluencias_tecnicas?: string[];
    resumo_rapido: string;
  };
}

// Função principal para analisar gráfico via backend
export async function analyzeTickrify(file: File): Promise<TickrifyAnalysisResponse> {
  try {
    console.log('🚀 [BACKEND] Convertendo arquivo para data URL...');
    console.log('🚀 [BACKEND] Arquivo:', { name: file.name, size: file.size, type: file.type });
    
    const data_url = await fileToDataURL(file);
    console.log('🚀 [BACKEND] Data URL criada (tamanho):', data_url.length);
    
    console.log('🚀 [BACKEND] Enviando para backend FastAPI...');
    const res = await fetch(`${API_BASE_URL}/tickrify/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data_url })
    });

    console.log('🚀 [BACKEND] Resposta recebida - Status:', res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ [BACKEND] Erro HTTP:', res.status, errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    const backendResponse: TickrifyBackendResponse = await res.json();
    console.log("✅ [BACKEND] Resposta completa do backend:", backendResponse);
    console.log("✅ [BACKEND] Market Snapshot presente:", !!backendResponse.market_snapshot);

    if (backendResponse.market_snapshot) {
      console.log("💰 [BACKEND] Market Snapshot recebido:", backendResponse.market_snapshot);
    } else {
      console.warn("❌ [BACKEND] Market Snapshot NÃO ENCONTRADO na resposta!");
    }

    // Converter a resposta completa para o formato simplificado
    const convertedResponse = convertBackendToSimple(backendResponse);
    console.log("✅ [BACKEND] Resposta convertida:", convertedResponse);
    console.log("✅ [BACKEND] Market Snapshot na resposta convertida:", !!convertedResponse.market_snapshot);
    
    return convertedResponse;

  } catch (error) {
    console.error('❌ [BACKEND] Erro na análise Tickrify:', error);
    throw error;
  }
}

// Função para converter a resposta completa do backend para formato simplificado
function convertBackendToSimple(backendResponse: TickrifyBackendResponse): TickrifyAnalysisResponse {
  console.log('🔄 [CONVERT] Convertendo resposta do backend:', backendResponse);
  
  // Garantir que campos obrigatórios existam, mesmo que com valores padrão
  const analise_metadata = backendResponse.analise_metadata || {
    qualidade_imagem: "Inadequada",
    simbolo_detectado: "N/D", 
    timeframe_detectado: "N/D"
  };
  
  const decisao_analista = backendResponse.decisao_analista || {
    recomendacao: "AGUARDAR",
    qualidade_oportunidade: "Inexistente",
    justificativa_confluencia: "Imagem inadequada para análise",
    fatores_convergentes: [],
    fatores_divergentes: ["Qualidade da imagem inadequada"]
  };
  
  const gestao_risco_sugerida = backendResponse.gestao_risco_sugerida || {
    preco_entrada: "N/D",
    stop_loss: "N/D",
    take_profit: "N/D"
  };
  
  const estrutura_mercado = backendResponse.estrutura_mercado || {
    tendencia_primaria: "Indefinida",
    tendencia_secundaria: "Indefinida",
    descricao_contexto: "Não foi possível analisar a estrutura do mercado",
    suportes_visiveis: [],
    resistencias_visiveis: []
  };
  
  // PRESERVAR INTEGRALMENTE O MARKET_SNAPSHOT - PRIORIDADE MÁXIMA
  const market_snapshot = {
    ...backendResponse.market_snapshot,
    simbolo_mercado: backendResponse.market_snapshot?.simbolo_mercado || "ATIVO_NÃO_IDENTIFICADO",
    preco_atual: backendResponse.market_snapshot?.preco_atual || "VALOR_NÃO_DETECTADO",
    variacao_24h: backendResponse.market_snapshot?.variacao_24h || "N/D",
    variacao_percentual: backendResponse.market_snapshot?.variacao_percentual || "N/D",
    maxima_24h: backendResponse.market_snapshot?.maxima_24h || "N/D",
    minima_24h: backendResponse.market_snapshot?.minima_24h || "N/D",
    volume_24h: backendResponse.market_snapshot?.volume_24h || "N/D",
    tendencia_atual: backendResponse.market_snapshot?.tendencia_atual || "N/D",
    forca_tendencia: backendResponse.market_snapshot?.forca_tendencia || "N/D",
    indicadores_resumo: backendResponse.market_snapshot?.indicadores_resumo || ["Imagem inadequada"],
    confluencias_tecnicas: backendResponse.market_snapshot?.confluencias_tecnicas || [],
    resumo_rapido: backendResponse.market_snapshot?.resumo_rapido || "Imagem inadequada para análise técnica - símbolo e valor não detectados"
  };

  // VALIDAÇÃO CRÍTICA: Garantir que símbolo e preço não sejam N/D se possível
  if (market_snapshot.simbolo_mercado === "ATIVO_NÃO_IDENTIFICADO" && analise_metadata.simbolo_detectado !== "N/D") {
    market_snapshot.simbolo_mercado = analise_metadata.simbolo_detectado;
  }

  console.log('💰 [CONVERT] Market snapshot GARANTIDO:', market_snapshot);
  console.log('🏷️ [CONVERT] Símbolo final:', market_snapshot.simbolo_mercado);
  console.log('💵 [CONVERT] Preço final:', market_snapshot.preco_atual);

  // Mapear recomendação com CONGRUÊNCIA
  let action: 'buy' | 'sell' | 'hold';
  switch (decisao_analista.recomendacao) {
    case 'COMPRA':
      action = 'buy';
      break;
    case 'VENDA':
      action = 'sell';
      break;
    case 'AGUARDAR':
    case 'NEUTRO':
    default:
      action = 'hold';
  }

  // Calcular confiança baseada na qualidade da oportunidade COM VALIDAÇÃO
  let confidence: number;
  switch (decisao_analista.qualidade_oportunidade) {
    case 'Alta':
      confidence = 85; // Usar números inteiros para compatibilidade
      break;
    case 'Media':
      confidence = 65;
      break;
    case 'Baixa':
      confidence = 45;
      break;
    case 'Inexistente':
    default:
      confidence = 25;
  }

  // Compilar justificativa DETALHADA e CONGRUENTE
  const rationale = `${decisao_analista.justificativa_confluencia}

📊 ANÁLISE ESTRUTURAL:
• Tendência Primária: ${estrutura_mercado.tendencia_primaria}
• Tendência Secundária: ${estrutura_mercado.tendencia_secundaria}
• Contexto: ${estrutura_mercado.descricao_contexto}

🎯 SINAIS TÉCNICOS:
• Clareza: ${backendResponse.sinais_tecnicos?.diagnostico_clareza || 'N/D'}
• Padrão: ${backendResponse.sinais_tecnicos?.padrao_candlestick?.nome || 'N/D'}

✅ FATORES CONVERGENTES:
${decisao_analista.fatores_convergentes.map(f => `• ${f}`).join('\n')}

${decisao_analista.fatores_divergentes.length > 0 ? 
`❌ FATORES DIVERGENTES:\n${decisao_analista.fatores_divergentes.map(f => `• ${f}`).join('\n')}` : ''}

🎯 GESTÃO DE RISCO:
• Entrada: ${gestao_risco_sugerida.preco_entrada}
• Stop Loss: ${gestao_risco_sugerida.stop_loss}
• Take Profit: ${gestao_risco_sugerida.take_profit}

💰 MARKET SNAPSHOT:
• Símbolo: ${market_snapshot.simbolo_mercado || 'N/D'}
• Preço Atual: ${market_snapshot.preco_atual}
• Variação: ${market_snapshot.variacao_24h}
• Volume: ${market_snapshot.volume_24h}
• Tendência: ${market_snapshot.tendencia_atual || 'N/D'}
• Força: ${market_snapshot.forca_tendencia || 'N/D'}

📈 INDICADORES:
${market_snapshot.indicadores_resumo.map((i: string) => `• ${i}`).join('\n')}

🔗 CONFLUÊNCIAS TÉCNICAS:
${((market_snapshot as any).confluencias_tecnicas || []).map((c: string) => `• ${c}`).join('\n')}`;

  // Extrair níveis chave COM VALIDAÇÃO
  const key_levels: number[] = [];
  
  // Função auxiliar para extrair números de strings
  const extractNumber = (str: string): number | null => {
    const match = str.match(/[\d,]+[\.,]?\d*/);
    if (match) {
      const cleanStr = match[0].replace(',', '.');
      const num = parseFloat(cleanStr);
      return isNaN(num) ? null : num;
    }
    return null;
  };
  
  // Adicionar suportes e resistências
  estrutura_mercado.suportes_visiveis.forEach(nivel => {
    const num = extractNumber(nivel);
    if (num !== null) key_levels.push(num);
  });
  
  estrutura_mercado.resistencias_visiveis.forEach(nivel => {
    const num = extractNumber(nivel);
    if (num !== null) key_levels.push(num);
  });

  // Adicionar preços de gestão de risco
  const entryPrice = extractNumber(gestao_risco_sugerida.preco_entrada);
  const stopLoss = extractNumber(gestao_risco_sugerida.stop_loss);
  const takeProfit = extractNumber(gestao_risco_sugerida.take_profit);
  
  if (entryPrice !== null) key_levels.push(entryPrice);
  if (stopLoss !== null) key_levels.push(stopLoss);
  if (takeProfit !== null) key_levels.push(takeProfit);

  const result = {
    action,
    confidence,
    rationale: rationale.trim(),
    key_levels: [...new Set(key_levels)].sort((a, b) => a - b), // Remove duplicatas e ordena
    timeframe: analise_metadata.timeframe_detectado || '1H',
    market_snapshot // PRESERVAR TOTALMENTE OS DADOS DO MARKET_SNAPSHOT
  };

  console.log('✅ [CONVERT] Resultado final:', result);
  console.log('💰 [CONVERT] Market snapshot no resultado:', !!result.market_snapshot);
  
  return result;
}

// Função para verificar saúde do backend
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/debug/ping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const result = await response.json();
    return result.ok === true;
  } catch (error) {
    console.error('Backend não disponível:', error);
    return false;
  }
}

// Função para converter resposta do backend para formato do frontend
export function convertTickrifyToFrontend(
  tickrifyResponse: TickrifyAnalysisResponse,
  symbol: string,
  imageData: string
): any {
  const { action, confidence, rationale, key_levels, timeframe, market_snapshot } = tickrifyResponse;
  
  // Mapear ação do backend para formato do frontend
  let recommendation: 'BUY' | 'SELL' | 'HOLD';
  let decisao: string;
  
  switch (action) {
    case 'buy':
      recommendation = 'BUY';
      decisao = 'COMPRA';
      break;
    case 'sell':
      recommendation = 'SELL';
      decisao = 'VENDA';
      break;
    default:
      recommendation = 'HOLD';
      decisao = 'AGUARDAR';
  }

  // Gerar preço base realista
  const basePrice = generateRealisticPrice(symbol);
  const confidencePercent = Math.floor(confidence * 100);

  // Calcular preços alvo e stop loss baseados nos key_levels se disponíveis
  let targetPrice = basePrice * (recommendation === 'BUY' ? 1.05 : 0.95);
  let stopLoss = basePrice * (recommendation === 'BUY' ? 0.97 : 1.03);

  if (key_levels && key_levels.length > 0) {
    // Usar os níveis reais do backend se disponíveis
    const sortedLevels = [...key_levels].sort((a, b) => a - b);
    
    if (recommendation === 'BUY') {
      // Para compra: target = nível de resistência mais próximo acima do preço atual
      targetPrice = sortedLevels.find(level => level > basePrice) || targetPrice;
      // Stop = nível de suporte mais próximo abaixo do preço atual
      stopLoss = sortedLevels.reverse().find(level => level < basePrice) || stopLoss;
    } else if (recommendation === 'SELL') {
      // Para venda: target = nível de suporte mais próximo abaixo do preço atual
      targetPrice = sortedLevels.reverse().find(level => level < basePrice) || targetPrice;
      // Stop = nível de resistência mais próximo acima do preço atual
      stopLoss = sortedLevels.find(level => level > basePrice) || stopLoss;
    }
  }

  return {
    analise_tecnica: rationale,
    decisao,
    justificativa_decisao: rationale,
    confianca_percentual: confidencePercent,
    indicadores_utilizados: ['Análise IA Backend Avançada'],
    simbolo_detectado: symbol,
    preco_atual: basePrice.toString(),
    timeframe_detectado: timeframe || '1H',
    symbol,
    recommendation,
    targetPrice,
    stopLoss,
    reasoning: rationale,
    imageData,
    key_levels: key_levels || [],
    market_snapshot,
    technicalIndicators: [
      {
        name: 'Análise IA Backend',
        value: action.toUpperCase(),
        signal: recommendation === 'BUY' ? 'BULLISH' : recommendation === 'SELL' ? 'BEARISH' : 'NEUTRAL',
        description: rationale
      }
    ]
  };
}

// Função auxiliar para gerar preço realista
function generateRealisticPrice(symbol: string): number {
  const basePrices: Record<string, number> = {
    'BTCUSDT': 43000,
    'ETHUSDT': 2600,
    'BNBUSDT': 320,
    'ADAUSDT': 0.52,
    'SOLUSDT': 110,
    'AAPL': 185,
    'GOOGL': 145,
    'TSLA': 210,
    'MSFT': 360,
    'AMZN': 155,
    'EURUSD': 1.0850,
    'GBPUSD': 1.2650,
    'USDJPY': 148.50,
    'XAUUSD': 2020
  };

  const basePrice = basePrices[symbol] || 100;
  const variation = (Math.random() - 0.5) * 0.1; // ±5% de variação
  return Math.round((basePrice * (1 + variation)) * 100) / 100;
}
