import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export interface FreeSavingEntry {
  id: string;
  amount: number;
}

export function useFreeSavings(usuarioId: number) {
  const [entries, setEntries] = useState<FreeSavingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchEntries();
  }, [usuarioId]);

  const fetchEntries = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("ahorro_libre")
      .select("*")
      .eq("usuario_id", usuarioId)
      .order("id", { ascending: false });

    if (error) {
      console.error("Error al cargar ahorro libre:", error);
    } else {
      const mapped = data.map((row) => ({
        id: row.id.toString(),
        amount: parseFloat(row.monto_total),
      }));

      setEntries(mapped);

      const totalSavings = mapped.reduce((acc, entry) => acc + entry.amount, 0);
      setTotal(totalSavings);
    }

    setLoading(false);
  };

  const addFreeSaving = async (amount: number) => {
    if (amount <= 0) return;

    try {
      // Obtener el registro actual
      const { data: existing, error: fetchError } = await supabase
        .from('ahorro_libre')
        .select('monto_total')
        .eq('usuario_id', usuarioId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // Error distinto a "no encontrado"
        console.error('Error al obtener ahorro libre:', fetchError);
        return;
      }

      if (existing) {
        // Actualizar el monto sumando
        const nuevoMonto = existing.monto_total + amount;
        const { error: updateError } = await supabase
          .from('ahorro_libre')
          .update({ monto_total: nuevoMonto })
          .eq('usuario_id', usuarioId);

        if (updateError) {
          console.error('Error al actualizar ahorro libre:', updateError);
        }
      } else {
        // Crear registro inicial
        const { error: insertError } = await supabase
          .from('ahorro_libre')
          .insert([{ usuario_id: usuarioId, monto_total: amount }]);

        if (insertError) {
          console.error('Error al crear ahorro libre:', insertError);
        }
      }

      // Refrescar datos o estado si usas
      fetchEntries();

    } catch (error) {
      console.error('Error inesperado en addFreeSaving:', error);
    }
  };


  const withdrawFreeSaving = async (amount: number) => {
    if (amount <= 0) return;

    try {
      // Obtener el registro actual
      const { data: existing, error: fetchError } = await supabase
        .from('ahorro_libre')
        .select('monto_total')
        .eq('usuario_id', usuarioId)
        .single();

      if (fetchError) {
        console.error('Error al obtener ahorro libre para retiro:', fetchError);
        return;
      }

      if (!existing) {
        console.error('No existe ahorro libre para este usuario');
        return;
      }

      const nuevoMonto = existing.monto_total - amount;

      if (nuevoMonto < 0) {
        console.error('No hay suficiente saldo para retirar esa cantidad');
        return;
      }

      const { error: updateError } = await supabase
        .from('ahorro_libre')
        .update({ monto_total: nuevoMonto })
        .eq('usuario_id', usuarioId);

      if (updateError) {
        console.error('Error al actualizar ahorro libre al retirar:', updateError);
      } else {
        fetchEntries();
      }
    } catch (error) {
      console.error('Error inesperado en withdrawFreeSaving:', error);
    }
  };


  return {
    entries,      // todos los movimientos (positivos y negativos)
    total,        // total disponible
    loading,
    addFreeSaving,
    withdrawFreeSaving,
    refresh: fetchEntries,
  };
}
