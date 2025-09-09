import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { TrendingDown, CreditCard, Trash2 } from 'lucide-react';
import { Transaction } from '../App';

interface ExpenseSectionProps {
  transactions: Transaction[];
  selectedMonth: number;
  selectedYear: number;
  onDeleteTransaction: (transactionId: string) => void;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

export function ExpenseSection({ transactions, selectedMonth, selectedYear, onDeleteTransaction }: ExpenseSectionProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  // Filtrar gastos del mes actual
  const currentMonthExpenses = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === selectedMonth && 
           transactionDate.getFullYear() === selectedYear;
  });

  // Total de gastos del mes
  const totalMonthlyExpenses = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0);

  // Gastos por categoría
  const expensesByCategory = currentMonthExpenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  // Preparar datos para el gráfico de torta
  const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
    percentage: ((value / totalMonthlyExpenses) * 100).toFixed(1)
  }));

  // Top 3 categorías con mayor gasto
  const topCategories = pieData.sort((a, b) => b.value - a.value).slice(0, 3);

  // Calcular promedio diario
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const dailyAverage = totalMonthlyExpenses / daysInMonth;

  // Promedio semanal
  const weeklyAverage = dailyAverage * 7;

  // Generar datos para gráfico de gastos por semana
  const weeklyData = Array.from({ length: 4 }, (_, i) => {
    const weekStart = new Date(selectedYear, selectedMonth, i * 7 + 1);
    const weekEnd = new Date(selectedYear, selectedMonth, (i + 1) * 7);
    
    const weekExpenses = currentMonthExpenses.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= weekStart && tDate <= weekEnd;
    }).reduce((sum, t) => sum + t.amount, 0);

    return {
      week: `Sem ${i + 1}`,
      gastos: weekExpenses,
    };
  });

  const handleDeleteTransaction = (transactionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      onDeleteTransaction(transactionId);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-red-700">
          <TrendingDown className="h-5 w-5" />
          Gastos
        </CardTitle>
        <p className="text-2xl text-red-600">{formatCurrency(totalMonthlyExpenses)}</p>
        <p className="text-sm text-slate-600">Total del mes actual</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Métricas rápidas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-600 mb-1">Promedio diario</p>
            <p className="text-blue-700">{formatCurrency(dailyAverage)}</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-xs text-purple-600 mb-1">Promedio semanal</p>
            <p className="text-purple-700">{formatCurrency(weeklyAverage)}</p>
          </div>
        </div>

        {/* Gráfico de gastos por semana */}
        <div>
          <h4 className="text-sm mb-3 text-slate-700">Gastos por semana</h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis 
                  dataKey="week" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis hide />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Gastos']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="gastos" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de torta por categorías */}
        {pieData.length > 0 && (
          <div>
            <h4 className="text-sm mb-3 text-slate-700">Distribución por categoría</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ percentage }) => `${percentage}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top categorías */}
        <div>
          <h4 className="text-sm mb-3 text-slate-700">Top categorías con mayor gasto</h4>
          <div className="space-y-2">
            {topCategories.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-sm text-slate-700">{category.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-red-600">{formatCurrency(category.value)}</span>
                  <p className="text-xs text-slate-500">{category.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transacciones recientes */}
        <div>
          <h4 className="text-sm mb-3 text-slate-700">Transacciones recientes</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {currentMonthExpenses.slice().reverse().slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg group transition-colors">
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-slate-700">{transaction.description}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(transaction.date).toLocaleDateString('es-CL')} • {transaction.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-red-600">{formatCurrency(transaction.amount)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteTransaction(transaction.id, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto w-auto hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {currentMonthExpenses.length === 0 && (
              <div className="text-center py-4 text-slate-500 text-sm">
                No hay gastos registrados este mes
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}