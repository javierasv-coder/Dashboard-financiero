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
}

export function FinancialSummary({
  currentBalance,
  monthlyIncome,
  monthlyExpenses,
  monthlySavings,
  savingsRate,
  debt
}: FinancialSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
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
  );
}