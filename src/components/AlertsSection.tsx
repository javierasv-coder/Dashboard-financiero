import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Bell } from 'lucide-react';
import { Goal } from '../App';

interface AlertsSectionProps {
  monthlyExpenses: number;
  monthlyIncome: number;
  goals: Goal[];
}

export function AlertsSection({ monthlyExpenses, monthlyIncome, goals }: AlertsSectionProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  // Alertas del sistema
  const alerts = [];

  // Presupuesto recomendado (70% de ingresos para gastos)
  const recommendedBudget = monthlyIncome * 0.7;
  const budgetPercentage = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;

  if (monthlyExpenses > recommendedBudget) {
    alerts.push({
      type: 'warning',
      icon: AlertTriangle,
      title: 'Gastos elevados',
      description: `Estás gastando ${budgetPercentage.toFixed(1)}% de tus ingresos. Se recomienda mantener los gastos por debajo del 70%.`,
      action: 'Revisa tus gastos y considera reducir gastos no esenciales.'
    });
  }

  // Tasa de ahorro baja
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
  if (savingsRate < 20 && monthlyIncome > 0) {
    alerts.push({
      type: 'warning',
      icon: TrendingUp,
      title: 'Tasa de ahorro baja',
      description: `Tu tasa de ahorro es del ${savingsRate.toFixed(1)}%. Se recomienda ahorrar al menos el 20% de tus ingresos.`,
      action: 'Considera aumentar tus ingresos o reducir gastos para mejorar tu capacidad de ahorro.'
    });
  }

  // Metas próximas a vencer
  const upcomingDeadlines = goals.filter(goal => {
    const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    return daysLeft <= 30 && daysLeft > 0 && progress < 100;
  });

  upcomingDeadlines.forEach(goal => {
    const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    alerts.push({
      type: 'info',
      icon: Clock,
      title: 'Meta próxima a vencer',
      description: `La meta "${goal.name}" vence en ${daysLeft} días. Progreso actual: ${((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}%`,
      action: 'Considera hacer una contribución adicional para alcanzar tu meta a tiempo.'
    });
  });

  // Metas completadas recientemente
  const completedGoals = goals.filter(goal => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    return progress >= 100;
  });

  if (completedGoals.length > 0) {
    alerts.push({
      type: 'success',
      icon: CheckCircle,
      title: 'Metas completadas',
      description: `¡Felicidades! Has completado ${completedGoals.length} meta(s) financiera(s).`,
      action: 'Considera establecer nuevas metas o aumentar las existentes.'
    });
  }

  // Recordatorios mensuales
  const monthlyReminders = [
    {
      type: 'info',
      icon: Bell,
      title: 'Recordatorio de ahorro',
      description: 'Es un buen momento para transferir dinero a tu fondo de emergencia.',
      action: 'Programa una transferencia automática mensual para mantener el hábito de ahorro.'
    }
  ];

  // Próximos pagos importantes (datos mock)
  const upcomingPayments = [
    { name: 'Renta', amount: 1200, date: '2025-02-01', type: 'recurring' },
    { name: 'Tarjeta de crédito', amount: 500, date: '2025-02-05', type: 'debt' },
    { name: 'Seguro auto', amount: 800, date: '2025-02-15', type: 'insurance' },
  ];

  const paymentTypeColors = {
    recurring: 'text-blue-600',
    debt: 'text-red-600',
    insurance: 'text-purple-600'
  };

  const allAlerts = [...alerts, ...monthlyReminders];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <AlertTriangle className="h-5 w-5" />
          Alertas e Indicadores
        </CardTitle>
        <p className="text-sm text-slate-600">{alerts.length} alertas activas</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alertas del sistema */}
        <div className="space-y-3">
          {allAlerts.map((alert, index) => (
            <Alert key={index} className={`border-l-4 ${
              alert.type === 'warning' ? 'border-l-orange-500 bg-orange-50' :
              alert.type === 'success' ? 'border-l-emerald-500 bg-emerald-50' :
              'border-l-blue-500 bg-blue-50'
            }`}>
              <alert.icon className={`h-4 w-4 ${
                alert.type === 'warning' ? 'text-orange-600' :
                alert.type === 'success' ? 'text-emerald-600' :
                'text-blue-600'
              }`} />
              <AlertDescription>
                <div className="space-y-1">
                  <p className={`font-medium ${
                    alert.type === 'warning' ? 'text-orange-800' :
                    alert.type === 'success' ? 'text-emerald-800' :
                    'text-blue-800'
                  }`}>
                    {alert.title}
                  </p>
                  <p className="text-sm text-slate-700">{alert.description}</p>
                  <p className="text-xs text-slate-600 mt-2">{alert.action}</p>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>

        {/* Próximos pagos importantes */}
        <div>
          <h4 className="text-sm mb-3 text-slate-700">Próximos pagos importantes</h4>
          <div className="space-y-2">
            {upcomingPayments.map((payment, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-800">{payment.name}</p>
                  <p className="text-xs text-slate-600">
                    {new Date(payment.date).toLocaleDateString('es-CL')}
                  </p>
                </div>
                <span className={`text-sm ${paymentTypeColors[payment.type as keyof typeof paymentTypeColors]}`}>
                  {formatCurrency(payment.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Métricas financieras rápidas */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-emerald-50 p-3 rounded-lg">
            <p className="text-xs text-emerald-600 mb-1">Ratio de gastos</p>
            <p className={`text-emerald-700 ${budgetPercentage > 70 ? 'text-red-600' : ''}`}>
              {budgetPercentage.toFixed(1)}%
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-600 mb-1">Tasa de ahorro</p>
            <p className={`text-blue-700 ${savingsRate < 20 ? 'text-red-600' : ''}`}>
              {savingsRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}