import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
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
import { useGoals } from './hooks/useGoals';
import { useTransactions } from './hooks/useTransactions'; 
import { useFreeSavings } from './hooks/useFreeSavings';
import { useBills } from './hooks/useBills';

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

// --- Componente Dashboard ---
function Dashboard() {
  const { user, signOut } = useAuth();
  const usuarioId = user?.id || ''; 

  // Hooks de datos
  const { transactions, loading: loadingTransactions, addTransaction, deleteTransaction } = useTransactions(usuarioId); 
  const { goals, loading: loadingGoals, addGoal, deleteGoal, quickPayment: quickPaymentGoal, updateGoalAmount, useGoalSavings } = useGoals(usuarioId);
  const { total: freeSavings, loading: loadingFreeSavings, addFreeSaving, withdrawFreeSaving } = useFreeSavings(usuarioId);
  const { bills, loading: loadingBills, addBill, deleteBill, quickPayment } = useBills(usuarioId);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // --- CÁLCULOS ---

  // 1. Saldo Acumulado Simplificado (Todo el historial)
  // Suma todo lo que entra y resta todo lo que sale, sin filtros de fecha.
  const accumulatedBalance = transactions.reduce((acc, t) => {
    if (t.type === 'INGRESO') {
      return acc + t.amount;
    } else if (t.type === 'GASTO' || t.type === 'AHORRO') {
      return acc - t.amount;
    }
    return acc;
  }, 0);

  // 2. Métricas del Mes Actual (Para las gráficas y tarjetas mensuales)
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

  // Ahorro del mes: Gastos que tengan categoría "Ahorro"
  const monthlySavings = currentMonthTransactions
    .filter((t) => t.type === 'GASTO' && t.category === 'Ahorro')
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
  
  // 3. Otros Totales Globales
  const totalGoalSavings = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalAccumulatedSavings = freeSavings + totalGoalSavings; 

  const totalPendingDebt = bills.reduce((acc, bill) => {
    if (bill.paidInstallments >= bill.installments) return acc;
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
              Agregar
            </Button>
            <Button variant="outline" onClick={signOut} title="Cerrar Sesión">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

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
                updateGoal={updateGoalAmount} 
                onAddGoal={addGoal}
                onDeleteGoal={deleteGoal}
                addTransaction={addTransaction}
                freeSavings={freeSavings}
                onAddFreeSavings={addFreeSaving}
                onWithdrawFreeSavings={withdrawFreeSaving}
                onUseGoalSavings={useGoalSavings} 
            />
            <BillsSection 
                bills={bills}
                loading={loadingBills}
                addBill={addBill}
                deleteBill={deleteBill}
                quickPayment={quickPayment}
                addTransaction={addTransaction}
            />
        </div>
        
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AlertsSection 
            monthlyExpenses={monthlyExpenses}
            monthlyIncome={monthlyIncome}
            goals={goals}
          />
        </div>

        <TrendsSection transactions={transactions} selectedYear={selectedYear} />
      </div>

      <AddTransactionDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddTransaction={addTransaction}
      />
    </div>
  );
}

// --- Componente Principal ---
function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-emerald-600 font-medium">Cargando tu información...</div>;
  }

  if (!user) {
    return (
        <>
            <LoginPage />
            <Toaster />
        </>
    );
  }

  return (
    <>
      <Dashboard />
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
       <AppContent />
    </AuthProvider>
  );
}