import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Target, Calendar, DollarSign } from 'lucide-react';
import { Goal } from '../App';

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void;
}

const goalCategories = [
  'Emergencia',
  'Viaje',
  'Educación',
  'Inversión',
  'Hogar',
  'Salud',
  'Tecnología',
  'Automóvil',
  'Entretenimiento',
  'Otros'
];

export function AddGoalDialog({ open, onOpenChange, onAddGoal }: AddGoalDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    category: '',
    description: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      targetAmount: '',
      targetDate: '',
      category: '',
      description: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.targetAmount || !formData.targetDate || !formData.category) {
      return;
    }

    const goal: Omit<Goal, 'id' | 'currentAmount'> = {
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      targetDate: formData.targetDate,
      category: formData.category
    };

    onAddGoal(goal);
    resetForm();
    onOpenChange(false);
  };

  // Calcular fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0];

  // Calcular tiempo estimado para alcanzar la meta
  const calculateMonthsToTarget = () => {
    if (formData.targetDate && formData.targetAmount) {
      const targetDate = new Date(formData.targetDate);
      const today = new Date();
      const diffTime = targetDate.getTime() - today.getTime();
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
      const monthlyRequired = parseFloat(formData.targetAmount) / Math.max(diffMonths, 1);
      return { months: diffMonths, monthlyRequired };
    }
    return null;
  };

  const timeCalculation = calculateMonthsToTarget();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Agregar Nueva Meta Financiera
          </DialogTitle>
        </DialogHeader>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="flex items-center gap-3">
            <Target className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-blue-700">Nueva Meta</h3>
              <p className="text-xs text-blue-600">
                Define una meta financiera específica con fecha objetivo
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la meta *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ej: Viaje a Europa, Fondo de emergencia..."
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Cantidad objetivo *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-10"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">Fecha objetivo *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="targetDate"
                  type="date"
                  className="pl-10"
                  min={today}
                  value={formData.targetDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                  required
                />
              </div>
            </div>
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
                {goalCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Describe tu meta y por qué es importante para ti..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Cálculo automático */}
          {timeCalculation && timeCalculation.months > 0 && (
            <div className="bg-slate-50 p-3 rounded-lg">
              <h4 className="text-sm text-slate-700 mb-2">Análisis de la meta</h4>
              <div className="space-y-1 text-xs text-slate-600">
                <p>• Tiempo disponible: <span className="text-blue-600">{timeCalculation.months} meses</span></p>
                <p>• Ahorro mensual requerido: <span className="text-emerald-600">
                  {new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                  }).format(timeCalculation.monthlyRequired)}
                </span></p>
                <p>• Ahorro semanal requerido: <span className="text-purple-600">
                  {new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                  }).format(timeCalculation.monthlyRequired / 4)}
                </span></p>
              </div>
            </div>
          )}

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
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Target className="h-4 w-4 mr-2" />
              Crear Meta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}