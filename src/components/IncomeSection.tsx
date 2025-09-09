import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Trash2 } from 'lucide-react';
import { Transaction } from '../App';

interface IncomeSectionProps {
  transactions: Transaction[];
  selectedMonth: number;
  selectedYear: number;
  onDeleteTransaction: (transactionId: string) => void;
}

export function IncomeSection({ transactions, selectedMonth, selectedYear, onDeleteTransaction }: IncomeSectionProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  // Filtrar transacciones del mes actual
  const currentMonthIncome = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === selectedMonth && 
           transactionDate.getFullYear() === selectedYear;
  });

  // Calcular total del mes
  const totalMonthlyIncome = currentMonthIncome.reduce((sum, t) => sum + t.amount, 0);

  // Generar datos para el gráfico de los últimos 6 meses
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(selectedYear, selectedMonth - i, 1);
    const monthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
    });
    
    return {
      month: date.toLocaleDateString('es-CL', { month: 'short' }),
      income: monthTransactions.reduce((sum, t) => sum + t.amount, 0),
    };
  }).reverse();

  // Agrupar ingresos por categoría
  const incomeByCategory = currentMonthIncome.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const handleDeleteTransaction = (transactionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      onDeleteTransaction(transactionId);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-emerald-700">
          <TrendingUp className="h-5 w-5" />
          Ingresos
        </CardTitle>
        <p className="text-2xl text-emerald-600">{formatCurrency(totalMonthlyIncome)}</p>
        <p className="text-sm text-slate-600">Total del mes actual</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gráfico de tendencia */}
        <div>
          <h4 className="text-sm mb-3 text-slate-700">Tendencia de los últimos 6 meses</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
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
                  formatter={(value: number) => [formatCurrency(value), 'Ingresos']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#059669" 
                  strokeWidth={2}
                  dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#059669', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Desglose por categoría */}
        <div>
          <h4 className="text-sm mb-3 text-slate-700">Por categoría este mes</h4>
          <div className="space-y-2">
            {Object.entries(incomeByCategory).map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-slate-700">{category}</span>
                </div>
                <span className="text-sm text-emerald-600">{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transacciones recientes */}
        <div>
          <h4 className="text-sm mb-3 text-slate-700">Transacciones recientes</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {currentMonthIncome.slice().reverse().slice(0, 5).map((transaction) => (
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
                      <span className="text-sm text-emerald-600">{formatCurrency(transaction.amount)}</span>
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
            {currentMonthIncome.length === 0 && (
              <div className="text-center py-4 text-slate-500 text-sm">
                No hay ingresos registrados este mes
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}