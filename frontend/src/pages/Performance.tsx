import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Shield, Activity } from 'lucide-react';
import { mockPerformance } from '../data/mockData';

const pieData = [
  { name: 'Wins', value: 76.3, color: '#10b981' },
  { name: 'Losses', value: 23.7, color: '#ef4444' }
];

const monthlyData = [
  { month: 'Jan', profit: 2400, loss: 800 },
  { month: 'Feb', profit: 3200, loss: 1200 },
  { month: 'Mar', profit: 2800, loss: 900 },
  { month: 'Apr', profit: 4100, loss: 1500 },
  { month: 'May', profit: 1900, loss: 700 },
  { month: 'Jun', profit: 5200, loss: 1800 }
];

export function Performance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
        <p className="text-gray-600 mt-1">Detailed analysis of your trading performance and metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Total ROI</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{mockPerformance.roi.toFixed(1)}%</p>
          <p className="text-sm text-emerald-600 mt-1">+12.3% this month</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Win Rate</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{mockPerformance.winRate.toFixed(1)}%</p>
          <p className="text-sm text-blue-600 mt-1">+2.1% this month</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Sharpe Ratio</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{mockPerformance.sharpeRatio.toFixed(2)}</p>
          <p className="text-sm text-purple-600 mt-1">Excellent risk/reward</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Max Drawdown</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{mockPerformance.maxDrawdown.toFixed(1)}%</p>
          <p className="text-sm text-orange-600 mt-1">Low risk exposure</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Monthly P&L</h2>
          </div>
          <div className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="loss" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Win/Loss Distribution</h2>
          </div>
          <div className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Wins (76.3%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Losses (23.7%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}