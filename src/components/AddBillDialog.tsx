import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CreditCard } from 'lucide-react';
import { Bill } from './BillsSection';

interface AddBillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBill: (bill: Omit<Bill, 'id' | 'paidInstallments' | 'installmentAmount'>) => void;
}

const billCategories = [
  'Tarjeta de Crédito',
  'Préstamo Personal',
  'Préstamo Hipotecario',
  'Préstamo Vehicular',
  'Servicios',
  'Educación',
  'Seguros',
  'Otros'
];

export function AddBillDialog({ open, onOpenChange, onAddBill }: AddBillDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    totalAmount: '',
    installments: '',
    dueDate: '',
    category: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.totalAmount || !formData.installments || !formData.dueDate || !formData.category) {
      return;
    }

    const totalAmount = parseInt(formData.totalAmount);
    const installments = parseInt(formData.installments);
    
    onAddBill({
      name: formData.name,
      totalAmount: totalAmount,
      installments: installments,
      dueDate: formData.dueDate,
      category: formData.category
    });

    // Reset form
    setFormData({
      name: '',
      totalAmount: '',
      installments: '',
      dueDate: '',
      category: ''
    });
    
    onOpenChange(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate installment amount for preview
  const installmentAmount = formData.totalAmount && formData.installments 
    ? parseFloat(formData.totalAmount) / parseInt(formData.installments)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Agregar Nueva Cuenta
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Cuenta *</Label>
            <Input
              id="name"
              type="text"
              placeholder="ej. Tarjeta Visa, Préstamo Coche..."
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Monto Total *</Label>
              <Input
                id="totalAmount"
                type="number"
                step="1"
                min="0"
                placeholder="0"
                value={formData.totalAmount}
                onChange={(e) => handleChange('totalAmount', e.target.value)}
                onKeyDown={(e) => {
                  if (["-", "+", "e", "E", ".", ","].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="installments">Número de Cuotas *</Label>
              <Input
                id="installments"
                type="number"
                min="1"
                step="1"
                placeholder="12"
                value={formData.installments}
                onChange={(e) => handleChange('installments', e.target.value)}
                onKeyDown={(e) => {
                  if (["-", "+", "e", "E", ".", ","].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                required
              />
            </div>
          </div>

          {installmentAmount > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Cuota mensual: <strong>
                  {new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                  }).format(installmentAmount)}
                </strong>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="dueDate">Fecha de Vencimiento de Próxima Cuota *</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría *</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {billCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Agregar Cuenta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}