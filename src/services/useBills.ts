import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Bill } from "../components/BillsSection";

export function useBills(usuarioId: number) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, [usuarioId]);

  const fetchBills = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cuentas_pendientes")
      .select("*")
      .eq("usuario_id", usuarioId);

    if (error) {
      console.error("Error cargando cuentas:", error);
    } else if (data) {
      const mapped = data.map((row) => ({
        id: row.id.toString(),
        name: row.nombre,
        totalAmount: row.monto_total,
        installments: row.cuotas,
        paidInstallments: row.pagado ? row.cuotas : 0, // 👈 si quieres usar `pagado`
        installmentAmount: row.monto_cuota,
        dueDate: row.fecha_vencimiento,
        category: row.categoria,
      }));
      setBills(mapped);
    }
    setLoading(false);
  };

  const addBill = async (bill: Omit<Bill, "id" | "paidInstallments" | "installmentAmount">) => {
    const montoCuota = bill.totalAmount / bill.installments;

    const { data, error } = await supabase
      .from("cuentas_pendientes")
      .insert([
        {
          usuario_id: usuarioId,
          nombre: bill.name,
          monto_total: bill.totalAmount,
          cuotas: bill.installments,
          monto_cuota: montoCuota,
          fecha_vencimiento: bill.dueDate,
          pagado: false,
          categoria: bill.category,
          created_at: new Date(),
        },
      ])
      .select();

    if (error) {
      console.error("Error agregando cuenta:", error);
    } else {
      fetchBills();
    }
  };

  const deleteBill = async (id: string) => {
    const { error } = await supabase.from("cuentas_pendientes").delete().eq("id", id);

    if (error) {
      console.error("Error eliminando cuenta:", error);
    } else {
      setBills((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const quickPayment = async (id: string) => {
    // 👀 Este es un ejemplo: marcar cuenta como pagada completa
    const { error } = await supabase.from("cuentas_pendientes").update({ pagado: true }).eq("id", id);

    if (error) {
      console.error("Error actualizando cuenta:", error);
    } else {
      fetchBills();
    }
  };

  return { bills, loading, addBill, deleteBill, quickPayment };
}
