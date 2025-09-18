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

  const getExchangeUrl = (symbol: string) => {
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
    const exchangeUrl = getExchangeUrl(signal.symbol);
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-blue-300 w-full max-w-full sm:max-w-md mx-auto">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 sm:gap-0">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className={`p-2 sm:p-3 rounded-lg border ${colorClass}`}>
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{signal.symbol}</h3>
              <div className="flex items-center space-x-2">
                <p className="text-xs sm:text-sm text-gray-600 truncate">{signal.source}</p>
                {signal.source.includes('Análise IA') && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                    IA
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0">
            <div className="text-right flex-1">
              <p className="text-lg sm:text-2xl font-bold text-gray-900">${signal.price.toLocaleString()}</p>
              <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1 justify-end">
                <Clock className="w-4 h-4 mr-1" />
                {new Date(signal.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
            <div className="flex flex-row sm:flex-col space-x-1 sm:space-x-0 sm:space-y-1">
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
            <span className="text-xs sm:text-sm text-gray-600">Confiança</span>
            <span className="text-xs sm:text-sm font-semibold">{signal.confidence}%</span>
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

        <p className="text-gray-700 text-xs sm:text-sm mb-4 break-words">{signal.description}</p>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${colorClass} w-full sm:w-auto text-center`}>
            {signal.type === 'BUY' ? '🚀 COMPRAR' : 
             signal.type === 'SELL' ? '📉 VENDER' : '⏸️ AGUARDAR'}
          </span>
          
          <button
            onClick={handleTradeRedirect}
            className="flex items-center justify-center space-x-1 text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Operar</span>
          </button>
        </div>
      </div>
    </div>
  );
}