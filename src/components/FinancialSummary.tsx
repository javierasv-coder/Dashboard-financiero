import React from 'react';
import { Card, CardContent } from './ui/card';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, CreditCard } from 'lucide-react';

interface FinancialSummaryProps {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsRate: number;
  debt: number;
  totalAccumulatedSavings: number;
  goalSavings: number;
  freeSavings: number;
}

export function FinancialSummary({
  currentBalance,
  monthlyIncome,
  monthlyExpenses,
  monthlySavings,
  savingsRate,
  debt,
  totalAccumulatedSavings,
  goalSavings,
  freeSavings
}: FinancialSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const cards = [
    {
      title: 'Saldo Acumulado',
      value: formatCurrency(currentBalance),
      subtitle: 'Total disponible',
      icon: Wallet,
      color: currentBalance >= 0 ? 'text-emerald-600' : 'text-red-600',
      bgColor: currentBalance >= 0 ? 'bg-emerald-50' : 'bg-red-50',
      iconColor: currentBalance >= 0 ? 'text-emerald-600' : 'text-red-600',
    },
    {
      title: 'Ingresos del Mes',
      value: formatCurrency(monthlyIncome),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Gastos del Mes',
      value: formatCurrency(monthlyExpenses),
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
    },
    {
      title: 'Ahorro del Mes',
      value: formatCurrency(monthlySavings),
      subtitle: `${savingsRate.toFixed(1)}% del ingreso`,
      icon: PiggyBank,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Deuda Pendiente',
      value: formatCurrency(debt),
      icon: CreditCard,
      color: debt > 0 ? 'text-orange-600' : 'text-gray-600',
      bgColor: debt > 0 ? 'bg-orange-50' : 'bg-gray-50',
      iconColor: debt > 0 ? 'text-orange-600' : 'text-gray-600',
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                  <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-600 mb-1">{card.title}</p>
                  <p className={`text-xl font-medium ${card.color} truncate`}>
                    {card.value}
                  </p>
                  {card.subtitle && (
                    <p className="text-xs text-slate-500 mt-1">{card.subtitle}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Balance de Ahorros Desglosado */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <PiggyBank className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-slate-900">Balance de Ahorros</h3>
              <p className="text-sm text-slate-600">Distribución de tus ahorros</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Total Acumulado</p>
              <p className="text-xl text-blue-700">{formatCurrency(totalAccumulatedSavings)}</p>
              <p className="text-xs text-slate-500 mt-1">Todos los ahorros</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Ahorros con Metas</p>
              <p className="text-xl text-purple-700">{formatCurrency(goalSavings)}</p>
              <p className="text-xs text-slate-500 mt-1">Asignados a objetivos</p>
            </div>
            
            <div className="p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Ahorro Libre</p>
              <p className="text-xl text-emerald-700">{formatCurrency(freeSavings)}</p>
              <p className="text-xs text-slate-500 mt-1">Sin meta específica</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}