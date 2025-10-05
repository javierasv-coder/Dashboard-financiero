import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Transaction } from "../App";

export function useTransactions(usuarioId: number) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("transacciones")
      .select("*")
      .eq("usuario_id", usuarioId)
      .order("fecha", { ascending: false });

    if (error) {
      console.error("Error cargando transacciones:", error);
    } else if (data) {
      // Mapea los campos de supabase a tu interfaz Transaction
      const mapped: Transaction[] = data.map((row) => ({
        id: row.id.toString(),
        type: row.tipo as "INGRESO" | "GASTO" | "AHORRO",
        amount: Number(row.monto),
        category: row.categoria,
        description: row.descripcion,
        date: row.fecha, // Asegúrate que “fecha” tenga tipo compatible (string o timestamp → string)
      }));
      setTransactions(mapped);
    }
    setLoading(false);
  };

  // Crea una transacción
  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    const { data, error } = await supabase
      .from("transacciones")
      .insert([
        {
          usuario_id: 1, // 👈 estático por ahora
          tipo: transaction.type,
          monto: transaction.amount,
          categoria: transaction.category,
          descripcion: transaction.description,
          fecha: transaction.date,
        },
      ])
      .select();

    if (error) {
      console.error("Error agregando transacción:", error);
      return null;
    }
    // Opción: regresar la transacción insertada
    await fetchTransactions();
    return data;
  };

  // Eliminar transacción
  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from("transacciones").delete().eq("id", id);
    if (error) {
      console.error("Error eliminando transacción:", error);
      return false;
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    return true;
  };

  useEffect(() => {
    fetchTransactions();
  }, [usuarioId]);

  return {
    transactions,
    loading,
    fetchTransactions,
    addTransaction,
    deleteTransaction,
  };
}
