import React, { useState } from 'react';
import { FinancialSummary } from './components/FinancialSummary';
import { IncomeSection } from './components/IncomeSection';
import { ExpenseSection } from './components/ExpenseSection';
import { GoalsSection } from './components/GoalsSection';
import { TrendsSection } from './components/TrendsSection';
import { AlertsSection } from './components/AlertsSection';
import { BillsSection } from './components/BillsSection'; // ✅ ahora no recibe props
import { AddTransactionDialog } from './components/AddTransactionDialog';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { Plus, DollarSign } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useGoals } from './hooks/useGoals'; // Ajusta la ruta si es necesario

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'saving';
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  isUsed: boolean;
  description: string;
}

// Datos mock para la demostración
const mockTransactions: Transaction[] = [
  // Diciembre 2024 (mes anterior)
  { id: '101', type: 'income', amount: 3200, category: 'Salario', description: 'Salario diciembre', date: '2024-12-01' },
  { id: '102', type: 'income', amount: 400, category: 'Freelance', description: 'Proyecto pequeño', date: '2024-12-15' },
  { id: '103', type: 'expense', amount: 1200, category: 'Vivienda', description: 'Renta diciembre', date: '2024-12-01' },
  { id: '104', type: 'expense', amount: 250, category: 'Alimentación', description: 'Compras diciembre', date: '2024-12-10' },
  { id: '105', type: 'expense', amount: 120, category: 'Transporte', description: 'Gasolina diciembre', date: '2024-12-12' },
  { id: '106', type: 'saving', amount: 300, category: 'Ahorro', description: 'Ahorro diciembre', date: '2024-12-01' },
  
  // Enero 2025 (mes actual)
  { id: '1', type: 'income', amount: 3500, category: 'Salario', description: 'Salario mensual', date: '2025-01-01' },
  { id: '2', type: 'income', amount: 800, category: 'Freelance', description: 'Proyecto web', date: '2025-01-15' },
  { id: '3', type: 'expense', amount: 1200, category: 'Vivienda', description: 'Renta mensual', date: '2025-01-01' },
  { id: '4', type: 'expense', amount: 300, category: 'Alimentación', description: 'Compras del mes', date: '2025-01-10' },
  { id: '5', type: 'expense', amount: 150, category: 'Transporte', description: 'Gasolina y mantenimiento', date: '2025-01-12' },
  { id: '6', type: 'expense', amount: 100, category: 'Ocio', description: 'Cenas y entretenimiento', date: '2025-01-20' },
  { id: '7', type: 'saving', amount: 500, category: 'Ahorro', description: 'Ahorro mensual', date: '2025-01-01' },
];

const mockGoals: Goal[] = [
  { id: '1', name: 'Fondo de Emergencia', targetAmount: 10000, currentAmount: 3500, targetDate: '2025-12-31', category: 'Emergencia', isUsed: false, description: '' },
  { id: '2', name: 'Viaje a Europa', targetAmount: 5000, currentAmount: 1200, targetDate: '2025-06-30', category: 'Viaje', isUsed: false, description: '' },
  { id: '3', name: 'Curso de Programación', targetAmount: 1500, currentAmount: 1500, targetDate: '2025-03-31', category: 'Educación', isUsed: false, description: '' },
  { id: '4', name: 'Laptop Nueva', targetAmount: 2000, currentAmount: 2000, targetDate: '2025-01-15', category: 'Tecnología', isUsed: true, description: '' },
];

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const { goals, loading: loadingGoals, addGoal, deleteGoal, quickPayment, updateGoalAmount, useGoalSavings } = useGoals(1); // Usa el ID real del usuario autenticado
  const [freeSavings, setFreeSavings] = useState<number>(750); // Ahorro libre inicial
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  const deleteTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
  };


  /*
  const addGoal = (goal: Omit<Goal, 'id' | 'currentAmount' | 'isUsed'>) => {
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
      currentAmount: 0,
      isUsed: false,
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const updateGoal = (goalId: string, amount: number) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, currentAmount: goal.currentAmount + amount }
        : goal
    ));
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };*/
  /*
  const addBill = (bill: Omit<Bill, 'id' | 'paidInstallments' | 'installmentAmount'>) => {
    const installmentAmount = bill.totalAmount / bill.installments;
    const newBill: Bill = {
      ...bill,
      id: Date.now().toString(),
      paidInstallments: 0,
      installmentAmount: installmentAmount,
    };
    setBills(prev => [...prev, newBill]);
  };

  const deleteBill = (billId: string) => {
    setBills(prev => prev.filter(b => b.id !== billId));
  };

  const handleQuickPayment = (billId: string) => {
    const bill = bills.find(b => b.id === billId);
    if (!bill || bill.paidInstallments >= bill.installments) return;

    // Actualizar la cuenta (incrementar cuotas pagadas)
    setBills(prev => prev.map(b => 
      b.id === billId 
        ? { ...b, paidInstallments: b.paidInstallments + 1 }
        : b
    ));

    // Agregar automáticamente como gasto
    const quickExpense: Omit<Transaction, 'id'> = {
      type: 'expense',
      amount: bill.installmentAmount,
      category: 'Pago de Cuenta',
      description: `Pago rápido - ${bill.name}`,
      date: new Date().toISOString().split('T')[0],
    };

    addTransaction(quickExpense);

    // Mostrar notificación de éxito
    toast.success(`Pago realizado exitosamente`, {
      description: `Se descontaron ${new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
      }).format(bill.installmentAmount)} de ${bill.name}`,
    });
  };
  */
  const addFreeSavings = (amount: number) => {
    setFreeSavings(prev => prev + amount);
    
    // Registrar como transacción de ahorro
    const savingTransaction: Omit<Transaction, 'id'> = {
      type: 'saving',
      amount: amount,
      category: 'Ahorro Libre',
      description: 'Ahorro libre (sin meta específica)',
      date: new Date().toISOString().split('T')[0],
    };
    
    addTransaction(savingTransaction);
  };

  const withdrawFreeSavings = (amount: number, description: string) => {
    if (amount > freeSavings) {
      toast.error('Fondos insuficientes', {
        description: 'No tienes suficiente ahorro libre para este retiro',
      });
      return;
    }

    setFreeSavings(prev => prev - amount);
    
    // Registrar como gasto
    const expenseTransaction: Omit<Transaction, 'id'> = {
      type: 'expense',
      amount: amount,
      category: 'Retiro de Ahorro',
      description: `Retiro de ahorro libre: ${description}`,
      date: new Date().toISOString().split('T')[0],
    };
    
    addTransaction(expenseTransaction);

    toast.success('Retiro realizado exitosamente', {
      description: `Se retiraron ${new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
      }).format(amount)} del ahorro libre`,
    });
  };

  const handleUseGoalSavings = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal || goal.currentAmount === 0 || goal.isUsed) return;

    const amount = goal.currentAmount;

    // 🔗 Actualizar en Supabase
    useGoalSavings(goalId);

    // Registrar como gasto
    const expenseTransaction: Omit<Transaction, 'id'> = {
      type: 'expense',
      amount,
      category: 'Uso de Meta',
      description: `Se usaron ${new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
      }).format(amount)} para ${goal.name}`,
      date: new Date().toISOString().split('T')[0],
    };

    addTransaction(expenseTransaction);

    toast.success('Ahorro utilizado exitosamente', {
      description: `Se usaron ${new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
      }).format(amount)} para ${goal.name}`,
    });
  };

  // Calcular métricas del mes actual
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === selectedMonth && 
           transactionDate.getFullYear() === selectedYear;
  });

  const monthlyIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlySavings = currentMonthTransactions
    .filter(t => t.type === 'saving')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calcular saldo acumulado (de todos los meses hasta la fecha)
  const currentDate = new Date(selectedYear, selectedMonth + 1, 0); // Último día del mes seleccionado
  
  const totalIncome = transactions
    .filter(t => new Date(t.date) <= currentDate && t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => new Date(t.date) <= currentDate && t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSavings = transactions
    .filter(t => new Date(t.date) <= currentDate && t.type === 'saving')
    .reduce((sum, t) => sum + t.amount, 0);

  // El saldo acumulado incluye todo el historial hasta la fecha seleccionada
  const accumulatedBalance = totalIncome - totalExpenses - totalSavings;
  
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  // Calcular ahorros totales por categorías
  const totalGoalSavings = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalAccumulatedSavings = totalSavings + freeSavings;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl text-slate-900">Dashboard Financiero</h1>
              <p className="text-slate-600">Gestiona tus finanzas personales</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Transacción
          </Button>
        </div>

        {/* Resumen Financiero */}
        <FinancialSummary 
          currentBalance={accumulatedBalance}
          monthlyIncome={monthlyIncome}
          monthlyExpenses={monthlyExpenses}
          monthlySavings={monthlySavings}
          savingsRate={savingsRate}
          debt={0}
          totalAccumulatedSavings={totalAccumulatedSavings}
          goalSavings={totalGoalSavings}
          freeSavings={freeSavings}
        />

        {/* Grid de secciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IncomeSection 
            transactions={transactions.filter(t => t.type === 'income')}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onDeleteTransaction={deleteTransaction}
          />
          <ExpenseSection 
            transactions={transactions.filter(t => t.type === 'expense')}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onDeleteTransaction={deleteTransaction}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GoalsSection 
            goals={goals}
            updateGoal={updateGoalAmount} // ✅ actualiza en Supabase
            onAddGoal={addGoal}
            onDeleteGoal={deleteGoal}
            addTransaction={addTransaction}
            freeSavings={freeSavings}
            onAddFreeSavings={addFreeSavings}
            onWithdrawFreeSavings={withdrawFreeSavings}
            onUseGoalSavings={useGoalSavings} // ✅ actualiza en Supabase
          />


          <BillsSection />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AlertsSection 
            monthlyExpenses={monthlyExpenses}
            monthlyIncome={monthlyIncome}
            goals={goals}
          />
        </div>

        {/* Tendencias - Sección completa */}
        <TrendsSection 
          transactions={transactions}
          selectedYear={selectedYear}
        />
      </div>

      {/* Dialog para agregar transacciones */}
      <AddTransactionDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddTransaction={addTransaction}
      />

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}