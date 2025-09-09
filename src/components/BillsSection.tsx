import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { AddBillDialog } from './AddBillDialog';
import { 
  CreditCard, 
  Plus, 
  Calendar, 
  DollarSign,
  Trash2,
  Zap
} from 'lucide-react';

export interface Bill {
  id: string;
  name: string;
  totalAmount: number;
  installments: number;
  paidInstallments: number;
  installmentAmount: number;
  dueDate: string;
  category: string;
}

interface BillsSectionProps {
  bills: Bill[];
  onAddBill: (bill: Omit<Bill, 'id' | 'paidInstallments' | 'installmentAmount'>) => void;
  onDeleteBill: (billId: string) => void;
  onQuickPayment: (billId: string) => void;
}

export function BillsSection({ bills, onAddBill, onDeleteBill, onQuickPayment }: BillsSectionProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getBillStatus = (bill: Bill) => {
    if (bill.paidInstallments >= bill.installments) {
      return { status: 'completed', color: 'bg-emerald-500' };
    }
    
    const dueDate = new Date(bill.dueDate);
    const today = new Date();
    const isOverdue = dueDate < today && bill.paidInstallments < bill.installments;
    
    if (isOverdue) {
      return { status: 'overdue', color: 'bg-red-500' };
    }
    
    return { status: 'pending', color: 'bg-blue-500' };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <CardTitle>Cuentas Pendientes</CardTitle>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Agregar Cuenta
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bills.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tienes cuentas pendientes registradas</p>
              <p className="text-sm">Agrega una cuenta para comenzar a gestionar tus pagos</p>
            </div>
          ) : (
            bills.map((bill) => {
              const progress = (bill.paidInstallments / bill.installments) * 100;
              const { status, color } = getBillStatus(bill);
              const remainingAmount = (bill.installments - bill.paidInstallments) * bill.installmentAmount;
              
              return (
                <div key={bill.id} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${color}`}></div>
                      <h4>{bill.name}</h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteBill(bill.id)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-600">Cuotas</p>
                      <p className="text-sm">{bill.paidInstallments}/{bill.installments} pagadas</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-600">Vencimiento</p>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <p className="text-sm">{formatDate(bill.dueDate)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-slate-600">Progreso</span>
                      <span className="text-sm">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-600">Próxima cuota</p>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-slate-400" />
                        <p className="text-sm">{formatCurrency(bill.installmentAmount)}</p>
                      </div>
                      <p className="text-xs text-slate-500">
                        Restante: {formatCurrency(remainingAmount)}
                      </p>
                    </div>
                    
                    {bill.paidInstallments < bill.installments && (
                      <Button
                        onClick={() => onQuickPayment(bill.id)}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Pago Rápido
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>

      <AddBillDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddBill={onAddBill}
      />
    </Card>
  );
}