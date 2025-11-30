import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Bill } from "../components/BillsSection";

export function useBills(usuarioId: string) {
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
        paidInstallments: row.cuotas_pagadas || 0,
        installmentAmount: row.monto_cuota,
        dueDate: row.fecha_vencimiento,
        category: row.categoria,
      }));
      setBills(mapped);
    }
    setLoading(false);
  };

  const addBill = async (bill: Omit<Bill, "id" | "paidInstallments" | "installmentAmount">) => {
    const montoCuota = Math.round(bill.totalAmount / bill.installments);

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
    const bill = bills.find((b) => b.id === id);
    if (!bill) return null;
    if (bill.paidInstallments >= bill.installments) return null;

    const newPaidInstallments = bill.paidInstallments + 1;
    const isFullyPaid = newPaidInstallments === bill.installments;

    // 1. Actualiza la cuenta en la BD
    const { error: updateError } = await supabase
      .from("cuentas_pendientes")
      .update({
        pagado: isFullyPaid,
        cuotas_pagadas: newPaidInstallments,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error actualizando cuota:", updateError);
      return null;
    }
    
    // Refrescamos la lista local de cuentas
    fetchBills();

    // Devolvemos los datos necesarios para que el Frontend cree la transacción
    return {
      amount: bill.installmentAmount,
      name: bill.name,
      newInstallmentCount: newPaidInstallments,
      totalInstallments: bill.installments
    };
  };


  return { bills, loading, addBill, deleteBill, quickPayment };
}
