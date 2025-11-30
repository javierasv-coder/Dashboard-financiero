import React, { use, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Importar contexto
import { LoginPage } from './components/LoginPage'; // Importar Login
import { FinancialSummary } from './components/FinancialSummary';
import { IncomeSection } from './components/IncomeSection';
import { ExpenseSection } from './components/ExpenseSection';
import { GoalsSection } from './components/GoalsSection';
import { TrendsSection } from './components/TrendsSection';
import { AlertsSection } from './components/AlertsSection';
import { BillsSection } from './components/BillsSection'; 
import { AddTransactionDialog } from './components/AddTransactionDialog';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { Plus, DollarSign, LogOut } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useGoals } from './hooks/useGoals';
import { useTransactions } from './hooks/useTransactions'; 
import { useFreeSavings } from './hooks/useFreeSavings';
import { useBills } from './hooks/useBills';
import type { Bill } from './components/BillsSection'; // Importamos el tipo

export interface Transaction {
  id: string;
  type: 'INGRESO' | 'GASTO' | 'AHORRO';
  amount: number;
  category: string;
  description: string;
  date: string;
  meta_id?: string | null;
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
  { id: '101', type: 'INGRESO', amount: 3200, category: 'Salario', description: 'Salario diciembre', date: '2024-12-01' },
  { id: '102', type: 'INGRESO', amount: 400, category: 'Freelance', description: 'Proyecto pequeño', date: '2024-12-15' },
  { id: '103', type: 'GASTO', amount: 1200, category: 'Vivienda', description: 'Renta diciembre', date: '2024-12-01' },
  { id: '104', type: 'GASTO', amount: 250, category: 'Alimentación', description: 'Compras diciembre', date: '2024-12-10' },
  { id: '105', type: 'GASTO', amount: 120, category: 'Transporte', description: 'Gasolina diciembre', date: '2024-12-12' },
  { id: '106', type: 'AHORRO', amount: 300, category: 'Ahorro', description: 'Ahorro diciembre', date: '2024-12-01' },
  
  // Enero 2025 (mes actual)
  { id: '1', type: 'INGRESO', amount: 3500, category: 'Salario', description: 'Salario mensual', date: '2025-01-01' },
  { id: '2', type: 'INGRESO', amount: 800, category: 'Freelance', description: 'Proyecto web', date: '2025-01-15' },
  { id: '3', type: 'GASTO', amount: 1200, category: 'Vivienda', description: 'Renta mensual', date: '2025-01-01' },
  { id: '4', type: 'GASTO', amount: 300, category: 'Alimentación', description: 'Compras del mes', date: '2025-01-10' },
  { id: '5', type: 'GASTO', amount: 150, category: 'Transporte', description: 'Gasolina y mantenimiento', date: '2025-01-12' },
  { id: '6', type: 'GASTO', amount: 100, category: 'Ocio', description: 'Cenas y entretenimiento', date: '2025-01-20' },
  { id: '7', type: 'AHORRO', amount: 500, category: 'Ahorro', description: 'Ahorro mensual', date: '2025-01-01' },
];

const mockGoals: Goal[] = [
  { id: '1', name: 'Fondo de Emergencia', targetAmount: 10000, currentAmount: 3500, targetDate: '2025-12-31', category: 'Emergencia', isUsed: false, description: '' },
  { id: '2', name: 'Viaje a Europa', targetAmount: 5000, currentAmount: 1200, targetDate: '2025-06-30', category: 'Viaje', isUsed: false, description: '' },
  { id: '3', name: 'Curso de Programación', targetAmount: 1500, currentAmount: 1500, targetDate: '2025-03-31', category: 'Educación', isUsed: false, description: '' },
  { id: '4', name: 'Laptop Nueva', targetAmount: 2000, currentAmount: 2000, targetDate: '2025-01-15', category: 'Tecnología', isUsed: true, description: '' },
];

function Dashboard(){
  const { user, signOut } = useAuth();
  const usuarioId = user?.id || '';
  const {transactions, loading: loadingTransactions, addTransaction, deleteTransaction} = useTransactions(usuarioId); 
  const { goals, loading: loadingGoals, addGoal, deleteGoal, quickPayment: quickPaymentGoal, updateGoalAmount, useGoalSavings } = useGoals(usuarioId); // Renombré quickPayment a quickPaymentGoal para evitar colisión
  const { total: freeSavings, loading: loadingFreeSavings, addFreeSaving, withdrawFreeSaving, refresh } = useFreeSavings(usuarioId);
  const { bills, loading: loadingBills, addBill, deleteBill, quickPayment } = useBills(usuarioId);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleUseGoalSavings = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal || goal.currentAmount === 0 || goal.isUsed) return;

    const amount = goal.currentAmount;

    // Actualiza en Supabase (marca la meta como usada)
    useGoalSavings(goalId);

    // Registrar como gasto
    const expenseTransaction: Omit<Transaction, 'id'> = {
      type: 'GASTO',
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
  const currentMonthTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const monthlyIncome = currentMonthTransactions
    .filter((t) => t.type === 'INGRESO')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = currentMonthTransactions
    .filter((t) => t.type === 'GASTO')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlySavings = currentMonthTransactions
    .filter((t) => t.type === 'GASTO' && t.category === 'Ahorro')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calcular saldo acumulado (de todos los meses hasta la fecha)
  const currentDate = new Date(selectedYear, selectedMonth + 1, 0); // Último día del mes seleccionado
  
  const totalIncome = transactions
    .filter((t) => new Date(t.date) <= currentDate && t.type === 'INGRESO')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => new Date(t.date) <= currentDate && t.type === 'GASTO')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSavings = transactions
    .filter((t) => new Date(t.date) <= currentDate && t.type === 'AHORRO')
    .reduce((sum, t) => sum + t.amount, 0);

  // El saldo acumulado incluye todo el historial hasta la fecha seleccionada
  const accumulatedBalance = totalIncome - totalExpenses - totalSavings;
  
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  // Calcular ahorros totales por categorías
  const totalGoalSavings = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalAccumulatedSavings = totalSavings + freeSavings;

  const totalPendingDebt = bills.reduce((acc, bill) => {
    if (bill.paidInstallments >= bill.installments) {
     return acc;
    }
    const remainingAmount = (bill.installments - bill.paidInstallments) * bill.installmentAmount;
    return acc + (remainingAmount > 0 ? remainingAmount : 0);
  }, 0);

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
              <p className="text-slate-600 text-xs">Usuario: {user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
             <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Transacción
            </Button>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Resumen Financiero */}
        <FinancialSummary 
          currentBalance={accumulatedBalance}
          monthlyIncome={monthlyIncome}
          monthlyExpenses={monthlyExpenses}
          monthlySavings={monthlySavings}
          savingsRate={savingsRate}
          debt={totalPendingDebt}
          totalAccumulatedSavings={totalAccumulatedSavings}
          goalSavings={totalGoalSavings}
          freeSavings={freeSavings}
        />

        {/* Grid de secciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IncomeSection 
            transactions={transactions.filter(t => t.type === 'INGRESO')}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onDeleteTransaction={deleteTransaction}
          />
          <ExpenseSection 
            transactions={transactions.filter(t => t.type === 'GASTO')}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onDeleteTransaction={deleteTransaction}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GoalsSection 
            usuarioId={usuarioId as unknown as number}
            goals={goals}
            updateGoal={updateGoalAmount} // ✅ actualiza en Supabase
            onAddGoal={addGoal}
            onDeleteGoal={deleteGoal}
            addTransaction={addTransaction}
            freeSavings={freeSavings}
            onAddFreeSavings={addFreeSaving}
            onWithdrawFreeSavings={withdrawFreeSaving}
            onUseGoalSavings={useGoalSavings} // ✅ actualiza en Supabase
          />


          <BillsSection 
            bills={bills}
            loading={loadingBills}
            addBill={addBill}
            deleteBill={deleteBill}
            quickPayment={quickPayment}
          />
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
        onAddTransaction={(tx) => {
          addTransaction(tx);
        }}
      />

      {/* Toast notifications */}
      <Toaster />
    </div>
  );  

}


export default function App() {
  return (
    <AuthProvider>
       <AppContent />
    </AuthProvider>
  );
}

// Sub-componente para manejar la lógica de visualización
function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!user) {
    return (
        <>
            <LoginPage />
            <Toaster />
        </>
    );
  }

  return <Dashboard />;
}