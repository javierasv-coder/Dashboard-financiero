import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, DollarSign, TrendingDown, PiggyBank } from 'lucide-react';
import { Transaction } from '../App';

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  defaultTab?: 'INGRESO' | 'GASTO' | 'AHORRO';
}

const incomeCategories = [
  'Salario',
  'Freelance',
  'Inversiones',
  'Negocios',
  'Bonos',
  'Otros'
];

const expenseCategories = [
  'Vivienda',
  'Alimentación',
  'Transporte',
  'Salud',
  'Ocio',
  'Educación',
  'Servicios',
  'Compras',
  'Otros'
];

const savingsCategories = [
  'Ahorro',
  'Inversión',
  'Fondo de Emergencia',
  'Meta específica',
  'Otros'
];

export function AddTransactionDialog({ 
  open, 
  onOpenChange, 
  onAddTransaction, 
  defaultTab = 'INGRESO' 
}: AddTransactionDialogProps) {
  
  const [activeTab, setActiveTab] = useState<'INGRESO' | 'GASTO' | 'AHORRO'>(defaultTab);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
    }
  }, [open, defaultTab]);

  const resetForm = () => {
    setFormData({
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category || !formData.description) {
      return;
    }

    const transaction: Omit<Transaction, 'id'> = {
      type: activeTab,
      amount: parseInt(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date
    };

    onAddTransaction(transaction);
    resetForm();
    onOpenChange(false);
  };

  const getCategoriesForType = () => {
    switch (activeTab) {
      case 'INGRESO': return incomeCategories;
      case 'GASTO': return expenseCategories;
      case 'AHORRO': return savingsCategories;
    }
  };

  const getTabConfig = () => {
    switch (activeTab) {
      case 'INGRESO':
        return {
          title: 'Agregar Ingreso',
          icon: DollarSign,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          buttonColor: 'bg-emerald-600 hover:bg-emerald-700'
        };
      case 'GASTO':
        return {
          title: 'Agregar Gasto',
          icon: TrendingDown,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        };
      case 'AHORRO':
        return {
          title: 'Agregar Ahorro',
          icon: PiggyBank,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const config = getTabConfig();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Agregar Transacción
          </DialogTitle>
        </DialogHeader>
        
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => {
            setActiveTab(value as 'INGRESO' | 'GASTO' | 'AHORRO');
            setFormData(prev => ({ ...prev, category: '' }));
          }}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="INGRESO" className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Ingreso
            </TabsTrigger>
            <TabsTrigger value="GASTO" className="flex items-center gap-1">
              <TrendingDown className="h-4 w-4" />
              Gasto
            </TabsTrigger>
            <TabsTrigger value="AHORRO" className="flex items-center gap-1" disabled>
              <PiggyBank className="h-4 w-4" />
              Ahorro
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-6">
            <div className={`flex items-center gap-3 p-3 rounded-lg ${config.bgColor}`}>
              <config.icon className={`h-6 w-6 ${config.color}`} />
              <div>
                <h3 className={`${config.color}`}>{config.title}</h3>
                <p className="text-xs text-slate-600">
                  {activeTab === 'INGRESO' && 'Registra dinero que recibiste'}
                  {activeTab === 'GASTO' && 'Registra dinero que gastaste'}
                  {activeTab === 'AHORRO' && 'Registra dinero que ahorraste'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Cantidad *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  onKeyDown={(e) => {
                    if (["-", "+", "e", "E", ".", ","].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCategoriesForType().map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe la transacción..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
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
                  className={`flex-1 text-white ${config.buttonColor}`}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}