import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AddGoalDialog } from './AddGoalDialog';
import { Target, Calendar, TrendingUp, Plus, Trash2, PiggyBank, CheckCircle, Minus, Wallet } from 'lucide-react';
import { Goal, Transaction } from '../App';

interface GoalsSectionProps {
  goals: Goal[];
  updateGoal: (goalId: string, amount: number) => void;
  onAddGoal: (goal: Omit<Goal, 'id' | 'currentAmount' | 'isUsed'>) => void;
  onDeleteGoal: (goalId: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  freeSavings: number;
  onAddFreeSavings: (amount: number) => void;
  onWithdrawFreeSavings: (amount: number, description: string) => void;
  onUseGoalSavings: (goalId: string) => void;
}

export function GoalsSection({ 
  goals, 
  updateGoal, 
  onAddGoal, 
  onDeleteGoal, 
  addTransaction, 
  freeSavings, 
  onAddFreeSavings, 
  onWithdrawFreeSavings, 
  onUseGoalSavings 
}: GoalsSectionProps) {
  const [contributionAmounts, setContributionAmounts] = useState<Record<string, string>>({});
  const [freeSavingAmount, setFreeSavingAmount] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawDescription, setWithdrawDescription] = useState<string>('');
  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const calculateDaysUntilTarget = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleContribution = (goalId: string) => {
    const amount = parseFloat(contributionAmounts[goalId] || '0');
    if (amount > 0) {
      // Actualizar la meta
      updateGoal(goalId, amount);
      
      // Crear transacción de ahorro que se descuenta del saldo
      const goal = goals.find(g => g.id === goalId);
      addTransaction({
        type: 'saving',
        amount: amount,
        category: 'Meta: ' + (goal?.name || 'Meta financiera'),
        description: `Ahorro para ${goal?.name || 'meta financiera'}`,
        date: new Date().toISOString().split('T')[0]
      });
      
      setContributionAmounts(prev => ({ ...prev, [goalId]: '' }));
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta meta? Esta acción no se puede deshacer.')) {
      onDeleteGoal(goalId);
    }
  };

  const handleAddFreeSaving = () => {
    const amount = parseFloat(freeSavingAmount);
    if (amount > 0) {
      onAddFreeSavings(amount);
      setFreeSavingAmount('');
    }
  };

  const handleWithdrawFreeSaving = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount > 0 && withdrawDescription.trim()) {
      onWithdrawFreeSavings(amount, withdrawDescription.trim());
      setWithdrawAmount('');
      setWithdrawDescription('');
    }
  };

  const handleUseGoalSaving = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal && confirm(`¿Estás seguro de que quieres usar los ${formatCurrency(goal.currentAmount)} ahorrados para "${goal.name}"? Esta acción no se puede deshacer.`)) {
      onUseGoalSavings(goalId);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-emerald-600';
    if (progress >= 75) return 'bg-blue-600';
    if (progress >= 50) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getStatusColor = (progress: number) => {
    if (progress >= 100) return 'text-emerald-600';
    if (progress >= 75) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Target className="h-5 w-5" />
            Metas Financieras
          </CardTitle>
          <p className="text-sm text-slate-600">{goals.length} metas activas</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {goals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const daysLeft = calculateDaysUntilTarget(goal.targetDate);
            const remaining = goal.targetAmount - goal.currentAmount;
            
            return (
              <div key={goal.id} className="p-4 bg-slate-50 rounded-lg space-y-3 group">
                {/* Header de la meta */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-slate-800">{goal.name}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto w-auto hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-slate-600">{goal.category}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${getStatusColor(progress)}`}>
                      {progress.toFixed(1)}%
                    </p>
                    <p className="text-xs text-slate-600">
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </p>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between items-center text-xs text-slate-600">
                    <span>Faltan {formatCurrency(remaining)}</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span className={daysLeft < 0 ? 'text-red-600' : ''}>
                        {daysLeft > 0 ? `${daysLeft} días` : 'Fecha vencida'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fecha objetivo */}
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span>Meta: {formatDate(goal.targetDate)}</span>
                </div>

                {/* Agregar contribución */}
                {progress < 100 && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Cantidad a ahorrar"
                        value={contributionAmounts[goal.id] || ''}
                        onChange={(e) => setContributionAmounts(prev => ({
                          ...prev,
                          [goal.id]: e.target.value
                        }))}
                        className="flex-1 h-8 text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleContribution(goal.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3"
                      >
                        <PiggyBank className="h-3 w-3 mr-1" />
                        Ahorrar
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500">
                      💡 Al agregar ahorro, se descontará automáticamente de tu saldo disponible
                    </p>
                  </div>
                )}

                {/* Estado completado */}
                {progress >= 100 && !goal.isUsed && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 text-sm">
                      <TrendingUp className="h-4 w-4" />
                      <span>¡Meta completada!</span>
                    </div>
                    <Button
                      onClick={() => handleUseGoalSaving(goal.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm h-8 px-3"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Usar Ahorro ({formatCurrency(goal.currentAmount)})
                    </Button>
                  </div>
                )}

                {/* Estado usado */}
                {goal.isUsed && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-purple-600 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      <span>¡Meta completada y utilizada!</span>
                    </div>
                    <div className="text-xs text-slate-600 bg-purple-50 p-2 rounded">
                      💰 Se utilizaron {formatCurrency(goal.currentAmount)} para esta meta
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {goals.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Target className="h-8 w-8 mx-auto mb-2 text-slate-400" />
              <p className="text-sm">No tienes metas financieras activas</p>
              <p className="text-xs">Crea tu primera meta para comenzar a ahorrar</p>
            </div>
          )}

          {/* Sección de Ahorro Libre */}
          <div className="p-4 bg-emerald-50 rounded-lg space-y-3 border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-5 w-5 text-emerald-600" />
              <h4 className="text-emerald-800">Ahorro Libre</h4>
            </div>
            
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-slate-700">Disponible:</span>
              <span className="text-lg text-emerald-700">{formatCurrency(freeSavings)}</span>
            </div>

            {/* Agregar ahorro libre */}
            <div className="space-y-2">
              <p className="text-xs text-slate-600">💰 Agregar ahorro sin meta específica</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Cantidad a ahorrar"
                  value={freeSavingAmount}
                  onChange={(e) => setFreeSavingAmount(e.target.value)}
                  className="flex-1 h-8 text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleAddFreeSaving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3"
                >
                  <PiggyBank className="h-3 w-3 mr-1" />
                  Ahorrar
                </Button>
              </div>
            </div>

            {/* Retirar ahorro libre */}
            {freeSavings > 0 && (
              <div className="space-y-2 pt-2 border-t border-emerald-200">
                <p className="text-xs text-slate-600">💸 Retirar de ahorro libre</p>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Cantidad"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="flex-1 h-8 text-sm"
                      max={freeSavings}
                    />
                    <Input
                      type="text"
                      placeholder="Motivo del retiro"
                      value={withdrawDescription}
                      onChange={(e) => setWithdrawDescription(e.target.value)}
                      className="flex-1 h-8 text-sm"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={handleWithdrawFreeSaving}
                    className="bg-red-600 hover:bg-red-700 text-white h-8 px-3"
                    disabled={!withdrawAmount || !withdrawDescription.trim()}
                  >
                    <Minus className="h-3 w-3 mr-1" />
                    Retirar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Botón para agregar nueva meta */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setIsAddGoalDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Nueva Meta
          </Button>
        </CardContent>
      </Card>

      {/* Dialog para agregar meta */}
      <AddGoalDialog 
        open={isAddGoalDialogOpen}
        onOpenChange={setIsAddGoalDialogOpen}
        onAddGoal={onAddGoal}
      />
    </>
  );
}