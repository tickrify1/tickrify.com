import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Users, Send, Hash, TrendingUp, Clock, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  timestamp: Date;
  room: string;
}

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  activeUsers: number;
}

export function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>('chat-messages', []);
  const [activeRoom, setActiveRoom] = useState('swing');
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useLocalStorage<Record<string, number>>('chat-online-users', {
    swing: 47,
    scalp: 32
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatRooms: ChatRoom[] = [
    {
      id: 'swing',
      name: 'Swing Trading',
      description: 'Operações de médio prazo',
      icon: TrendingUp,
      color: 'bg-blue-600',
      activeUsers: onlineUsers.swing || 47
    },
    {
      id: 'scalp',
      name: 'Scalp Trading',
      description: 'Operações rápidas',
      icon: Zap,
      color: 'bg-green-600',
      activeUsers: onlineUsers.scalp || 32
    }
  ];

  // Simular mensagens automáticas dos bots
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance
        const rooms = ['swing', 'scalp'];
        const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
        
        const swingMessages = [
          'BTCUSDT rompeu a resistência de $43,500! 📈',
          'Formação de triângulo ascendente no ETHUSDT 🔺',
          'Volume crescente no AAPL, possível breakout',
          'Suporte forte em $42,000 no BTC, boa entrada',
          'TSLA testando média móvel de 50 períodos',
          'Divergência bullish no RSI do GOOGL 🚀',
          'Padrão ombro-cabeça-ombro invertido no SPY'
        ];

        const scalpMessages = [
          'Entrada rápida BTCUSDT 43,250 → 43,380 ✅',
          'Scalp ETHUSDT +15 pips em 2min ⚡',
          'Breakout de 1min no EURUSD, vamos!',
          'Stop loss atingido, -8 pips no GBPUSD',
          'Scalp perfeito no XAUUSD +$12/oz 💰',
          'Momentum forte no NASDAQ, entrando',
          'Saída rápida com +22 pips no USDJPY'
        ];

        const botUsers = [
          { name: 'TraderPro_2024', avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=40' },
          { name: 'CryptoMaster', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=40' },
          { name: 'SwingKing', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=40' },
          { name: 'ScalpHunter', avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=40' },
          { name: 'AITrader_Bot', avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=40' }
        ];

        const randomBot = botUsers[Math.floor(Math.random() * botUsers.length)];
        const messagePool = randomRoom === 'swing' ? swingMessages : scalpMessages;
        const randomMessage = messagePool[Math.floor(Math.random() * messagePool.length)];

        const newBotMessage: ChatMessage = {
          id: Date.now().toString() + Math.random(),
          userId: 'bot_' + randomBot.name,
          userName: randomBot.name,
          userAvatar: randomBot.avatar,
          message: randomMessage,
          timestamp: new Date(),
          room: randomRoom
        };

        setMessages(prev => [...prev, newBotMessage].slice(-100)); // Keep last 100 messages
      }

      // Simular mudanças no número de usuários online
      if (Math.random() > 0.8) { // 20% chance
        setOnlineUsers(prev => ({
          swing: Math.max(30, prev.swing + (Math.random() > 0.5 ? 1 : -1)),
          scalp: Math.max(20, prev.scalp + (Math.random() > 0.5 ? 1 : -1))
        }));
      }
    }, 8000 + Math.random() * 12000); // 8-20 seconds

    return () => clearInterval(interval);
  }, [setMessages, setOnlineUsers]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      message: newMessage.trim(),
      timestamp: new Date(),
      room: activeRoom
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const getRoomMessages = () => {
    return messages.filter(msg => msg.room === activeRoom).slice(-50); // Last 50 messages
  };

  const currentRoom = chatRooms.find(room => room.id === activeRoom);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Chat de Trading</h1>
              <p className="text-gray-600">Converse com outros traders em tempo real</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Room List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 flex items-center">
                  <Hash className="w-4 h-4 mr-2" />
                  Salas de Chat
                </h2>
              </div>
              <div className="p-2">
                {chatRooms.map((room) => {
                  const Icon = room.icon;
                  const isActive = activeRoom === room.id;
                  
                  return (
                    <button
                      key={room.id}
                      onClick={() => setActiveRoom(room.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors mb-2 ${
                        isActive 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 ${room.color} rounded-lg flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className={`font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                            {room.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-500">{room.activeUsers}</span>
                        </div>
                      </div>
                      <p className={`text-xs ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>
                        {room.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Online Users */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm mt-4">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Usuários Online
                </h3>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total ativo:</span>
                  <span className="font-semibold text-green-600">
                    {currentRoom?.activeUsers} usuários
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-[600px] flex flex-col">
              
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {currentRoom && (
                    <>
                      <div className={`w-10 h-10 ${currentRoom.color} rounded-lg flex items-center justify-center`}>
                        <currentRoom.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{currentRoom.name}</h3>
                        <p className="text-sm text-gray-500">{currentRoom.description}</p>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{currentRoom?.activeUsers} online</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {getRoomMessages().map((message) => (
                  <div key={message.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      {message.userAvatar ? (
                        <img 
                          src={message.userAvatar} 
                          alt={message.userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <Users className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">
                          {message.userName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {message.message}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Enviar mensagem para ${currentRoom?.name}...`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={500}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Enviar</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}