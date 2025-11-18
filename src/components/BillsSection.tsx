import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { AddBillDialog } from "./AddBillDialog";
import { CreditCard, Plus, Calendar, DollarSign, Trash2, Zap } from "lucide-react";

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
  loading: boolean;
  addBill: (bill: Omit<Bill, 'id' | 'paidInstallments' | 'installmentAmount'>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  quickPayment: (id: string) => Promise<void>;
}

export function BillsSection({ 
  bills, 
  loading, 
  addBill, 
  deleteBill, 
  quickPayment 
}: BillsSectionProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("es-CL", { day: "numeric", month: "short" });

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
        {loading ? (
          <p className="text-center text-slate-500">Cargando cuentas...</p>
        ) : bills.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tienes cuentas pendientes registradas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bills.map((bill) => {
              const progress = (bill.paidInstallments / bill.installments) * 100;
              const remainingAmount = (bill.installments - bill.paidInstallments) * bill.installmentAmount;

              return (
                <div key={bill.id} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4>{bill.name}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteBill(bill.id)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-slate-600">Cuotas</p>
                      <p className="text-sm">{bill.paidInstallments}/{bill.installments}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Vencimiento</p>
                      <p className="text-sm flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {formatDate(bill.dueDate)}
                      </p>
                    </div>
                  </div>

                  <Progress value={progress} className="h-2 mb-3" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Próxima cuota</p>
                      <p className="text-sm flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-slate-400" />
                        {formatCurrency(bill.installmentAmount)}
                      </p>
                      <p className="text-xs text-slate-500">Restante: {formatCurrency(remainingAmount)}</p>
                    </div>
                    {bill.paidInstallments < bill.installments && (
                      <Button
                        onClick={() => quickPayment(bill.id)}
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
            })}
          </div>
        )}
      </CardContent>

      <AddBillDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onAddBill={addBill} />
    </Card>
  );
}
