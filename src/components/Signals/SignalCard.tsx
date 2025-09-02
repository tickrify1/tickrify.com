import React from 'react';
import { TrendingUp, TrendingDown, Minus, Clock, ExternalLink, X, Copy, Share2 } from 'lucide-react';
import { Signal } from '../../types';

interface SignalCardProps {
  signal: Signal;
  onRemove?: (id: string) => void;
}

export function SignalCard({ signal, onRemove }: SignalCardProps) {
  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'BUY':
        return TrendingUp;
      case 'SELL':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getSignalColor = (type: string) => {
    switch (type) {
      case 'BUY':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'SELL':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getExchangeUrl = (symbol: string, type: string) => {
    // Detectar tipo de ativo e redirecionar para exchange apropriada
    if (symbol.includes('USDT') || symbol.includes('BTC') || symbol.includes('ETH')) {
      // Criptomoedas -> Binance
      return `https://www.binance.com/en/trade/${symbol}?ref=37754157`;
    } else {
      // Ações -> Interactive Brokers ou TD Ameritrade
      return `https://www.interactivebrokers.com/en/trading/products-stocks.php`;
    }
  };

  const handleTradeRedirect = () => {
    const exchangeUrl = getExchangeUrl(signal.symbol, signal.type);
    window.open(exchangeUrl, '_blank');
  };

  const handleCopySignal = () => {
    const signalText = `🎯 SINAL TICKRIFY

Símbolo: ${signal.symbol}
Tipo: ${signal.type}
Preço: $${signal.price.toLocaleString()}
Confiança: ${signal.confidence}%
Fonte: ${signal.source}

Análise: ${signal.description}

Horário: ${new Date(signal.timestamp).toLocaleString()}`;

    navigator.clipboard.writeText(signalText);
  };

  const handleShareSignal = () => {
    if (navigator.share) {
      navigator.share({
        title: `Sinal ${signal.type} - ${signal.symbol}`,
        text: `Sinal de ${signal.type} para ${signal.symbol} com ${signal.confidence}% de confiança`,
        url: window.location.href
      });
    } else {
      handleCopySignal();
    }
  };

  const Icon = getSignalIcon(signal.type);
  const colorClass = getSignalColor(signal.type);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg border ${colorClass}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{signal.symbol}</h3>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-600">{signal.source}</p>
                {signal.source.includes('Análise IA') && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                    IA
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">${signal.price.toLocaleString()}</p>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Clock className="w-4 h-4 mr-1" />
                {new Date(signal.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <button
                onClick={handleCopySignal}
                className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                title="Copiar sinal"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={handleShareSignal}
                className="text-gray-400 hover:text-green-500 transition-colors p-1"
                title="Compartilhar sinal"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {onRemove && (
                <button
                  onClick={() => onRemove(signal.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  title="Remover sinal"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Confiança</span>
            <span className="text-sm font-semibold">{signal.confidence}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                signal.confidence >= 80 ? 'bg-emerald-500' :
                signal.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${signal.confidence}%` }}
            ></div>
          </div>
        </div>

        <p className="text-gray-700 text-sm mb-4">{signal.description}</p>

        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${colorClass}`}>
            {signal.type === 'BUY' ? '🚀 COMPRAR' : 
             signal.type === 'SELL' ? '📉 VENDER' : '⏸️ AGUARDAR'}
          </span>
          
          <button
            onClick={handleTradeRedirect}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Operar</span>
          </button>
        </div>
      </div>
    </div>
  );
}