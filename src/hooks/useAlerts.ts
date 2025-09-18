import { useState, useEffect } from 'react';
import { Alert } from '../types';
import { useLocalStorage } from './useLocalStorage';

export function useAlerts() {
  const [alerts, setAlerts] = useLocalStorage<Alert[]>('tickrify-alerts', []);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(alerts.filter(alert => !alert.read).length);
  }, [alerts]);

  const addAlert = (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => {
    const newAlert: Alert = {
      ...alert,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    setAlerts(prev => [newAlert, ...prev.slice(0, 49)]); // Keep last 50 alerts
  };

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, read: true })));
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  // Simulate real-time alerts
  useEffect(() => {
    // Não gerar alertas automáticos para novos usuários
    if (alerts.length === 0) return;
    
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 30 seconds
        const alertTypes: Alert['type'][] = ['SIGNAL', 'PRICE', 'TECHNICAL', 'NEWS'];
        const severities: Alert['severity'][] = ['LOW', 'MEDIUM', 'HIGH'];
        const symbols = ['BTCUSDT', 'ETHUSDT', 'AAPL', 'GOOGL', 'TSLA'];
        
        const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const severity = severities[Math.floor(Math.random() * severities.length)];
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        
        const messages = {
          SIGNAL: [`New ${Math.random() > 0.5 ? 'BUY' : 'SELL'} signal for ${symbol}`, `AI detected strong momentum in ${symbol}`],
          PRICE: [`${symbol} reached target price`, `Price alert triggered for ${symbol}`],
          TECHNICAL: [`Technical breakout detected in ${symbol}`, `Support/resistance level tested in ${symbol}`],
          NEWS: [`Market news affecting ${symbol}`, `Important announcement for ${symbol}`]
        };

        addAlert({
          type,
          title: `${type.charAt(0) + type.slice(1).toLowerCase()} Alert`,
          message: messages[type][Math.floor(Math.random() * messages[type].length)],
          severity,
          symbol
        });
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    alerts,
    unreadCount,
    addAlert,
    markAsRead,
    markAllAsRead,
    removeAlert,
    clearAllAlerts
  };
}