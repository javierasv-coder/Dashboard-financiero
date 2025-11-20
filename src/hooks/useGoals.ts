import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Goal } from "../App";

export function useGoals(usuarioId: string) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, [usuarioId]);

  const fetchGoals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("metas")
      .select("*")
      .eq("usuario_id", usuarioId);

    if (error) {
      console.error("Error cargando metas:", error);
    } else if (data) {
      const mapped = data.map((row) => ({
        id: row.id.toString(),
        name: row.nombre,
        targetAmount: row.monto_objetivo,
        currentAmount: row.monto_acumulado,
        targetDate: row.fecha_limite,
        isUsed: row.completada,
        category: row.categoria,
        description: row.descripcion,
      }));
      setGoals(mapped);
    }
    setLoading(false);
  };

  const addGoal = async (goal: Omit<Goal, "id" | "currentAmount" | "isUsed">) => {

    const { data, error } = await supabase
      .from("metas")
      .insert([
        {
          usuario_id: usuarioId,
          nombre: goal.name,
          monto_objetivo: goal.targetAmount,
          monto_acumulado: 0,
          fecha_limite: goal.targetDate,
          completada: false,
          categoria: goal.category,
          descripcion: goal.description,
        },
      ])
      .select();

    if (error) {
      console.error("Error agregando metas:", error);
    } else {
      fetchGoals();
    }
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase.from("metas").delete().eq("id", id);

    if (error) {
      console.error("Error eliminando meta:", error);
    } else {
      setGoals((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const quickPayment = async (id: string) => {
    // 👀 Este es un ejemplo: marcar cuenta como pagada completa
    const { error } = await supabase.from("metas").update({ completada: true }).eq("id", id);

    if (error) {
      console.error("Error actualizando meta:", error);
    } else {
      fetchGoals();
    }
  };

  const updateGoalAmount = async (goalId: string, amount: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newAmount = goal.currentAmount + amount;

    const { error } = await supabase
      .from("metas")
      .update({ monto_acumulado: newAmount })
      .eq("id", goalId);

    if (error) {
      console.error("Error actualizando monto:", error);
    } else {
      fetchGoals();
    }
  };

  const useGoalSavings = async (goalId: string) => {
    const { error } = await supabase
      .from("metas")
      .update({ completada: true }) 
      .eq("id", goalId);

    if (error) {
      console.error("Error al usar ahorro de meta:", error);
    } else {
      fetchGoals(); 
    }
  };



  return { goals, loading, addGoal, deleteGoal, quickPayment, updateGoalAmount, useGoalSavings };
}
