import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Transaction } from '../App';

interface TrendsSectionProps {
  transactions: Transaction[];
  selectedYear: number;
}

export function TrendsSection({ transactions, selectedYear }: TrendsSectionProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  // Generar datos históricos de los últimos 12 meses
  const generateHistoricalData = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const savings = monthTransactions
        .filter(t => t.type === 'saving')
        .reduce((sum, t) => sum + t.amount, 0);

      const balance = income - expenses - savings;

      months.push({
        month: date.toLocaleDateString('es-CL', { month: 'short', year: '2-digit' }),
        income,
        expenses,
        savings,
        balance,
        balancePositive: balance >= 0 ? balance : 0,
        balanceNegative: balance < 0 ? Math.abs(balance) : 0,
      });
    }

    return months;
  };

  const historicalData = generateHistoricalData();

  // Calcular totales acumulados
  let runningBalance = 0;
  const balanceHistory = historicalData.map(month => {
    runningBalance += month.balance;
    return {
      ...month,
      cumulativeBalance: runningBalance,
    };
  });

  // Calcular estadísticas
  const avgIncome = historicalData.reduce((sum, month) => sum + month.income, 0) / historicalData.length;
  const avgExpenses = historicalData.reduce((sum, month) => sum + month.expenses, 0) / historicalData.length;
  const avgSavings = historicalData.reduce((sum, month) => sum + month.savings, 0) / historicalData.length;

  const positiveMonths = historicalData.filter(month => month.balance >= 0).length;
  const savingsRate = avgIncome > 0 ? (avgSavings / avgIncome) * 100 : 0;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-purple-700">
          <TrendingUp className="h-5 w-5" />
          Tendencias Financieras
        </CardTitle>
        <p className="text-sm text-slate-600">Análisis de los últimos 12 meses</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Métricas resumen */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-emerald-50 p-4 rounded-lg">
            <p className="text-xs text-emerald-600 mb-1">Ingreso promedio</p>
            <p className="text-emerald-700">{formatCurrency(avgIncome)}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-xs text-red-600 mb-1">Gasto promedio</p>
            <p className="text-red-700">{formatCurrency(avgExpenses)}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-xs text-blue-600 mb-1">Ahorro promedio</p>
            <p className="text-blue-700">{formatCurrency(avgSavings)}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-xs text-purple-600 mb-1">Meses positivos</p>
            <p className="text-purple-700">{positiveMonths}/12</p>
          </div>
        </div>

        {/* Gráfico de tendencias principales */}
        <div>
          <h4 className="text-sm mb-3 text-slate-700">Tendencia de ingresos, gastos y ahorros</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrency(value), 
                    name === 'income' ? 'Ingresos' : 
                    name === 'expenses' ? 'Gastos' : 'Ahorros'
                  ]}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#059669" 
                  strokeWidth={2}
                  dot={{ fill: '#059669', strokeWidth: 2, r: 3 }}
                  name="Ingresos"
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#dc2626" 
                  strokeWidth={2}
                  dot={{ fill: '#dc2626', strokeWidth: 2, r: 3 }}
                  name="Gastos"
                />
                <Line 
                  type="monotone" 
                  dataKey="savings" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={{ fill: '#2563eb', strokeWidth: 2, r: 3 }}
                  name="Ahorros"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de balance mensual */}
        <div>
          <h4 className="text-sm mb-3 text-slate-700">Balance mensual (positivo vs negativo)</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrency(value), 
                    name === 'balancePositive' ? 'Balance positivo' : 'Balance negativo'
                  ]}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="balancePositive" fill="#059669" radius={[4, 4, 0, 0]} name="Positivo" />
                <Bar dataKey="balanceNegative" fill="#dc2626" radius={[4, 4, 0, 0]} name="Negativo" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Balance acumulado */}
        <div>
          <h4 className="text-sm mb-3 text-slate-700">Balance acumulado</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={balanceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Balance acumulado']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="cumulativeBalance" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Análisis adicional */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <h4 className="text-sm mb-2 text-slate-700">Análisis financiero</h4>
          <div className="space-y-2 text-sm text-slate-600">
            <p>• Tasa de ahorro promedio: <span className="text-blue-600">{savingsRate.toFixed(1)}%</span></p>
            <p>• Meses con balance positivo: <span className="text-emerald-600">{positiveMonths}/12 ({((positiveMonths/12)*100).toFixed(1)}%)</span></p>
            <p>• Balance acumulado final: <span className={runningBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}>{formatCurrency(runningBalance)}</span></p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}