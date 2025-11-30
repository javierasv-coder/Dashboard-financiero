import React from 'react';
import { Card, CardContent } from './ui/card';
import { PiggyBank } from 'lucide-react';

interface SavingsSectionProps {
  totalAccumulatedSavings: number;
  goalSavings: number;
  freeSavings: number;
}

export function SavingsSection({
  totalAccumulatedSavings,
  goalSavings,
  freeSavings
}: SavingsSectionProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  return (
    <Card className="border-0 shadow-sm h-full">
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
        
        {/* CAMBIO: Se cambió 'grid-cols-1 md:grid-cols-3' por 'flex flex-col' para que sea columna */}
        <div className="flex flex-col gap-4">
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
  );
}