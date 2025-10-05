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
    const bill = bills.find((b) => b.id === id);
    if (!bill) return;

    // Si ya está completamente pagado, salir
    if (bill.paidInstallments >= bill.installments) return;

    const newPaidInstallments = bill.paidInstallments + 1;
    const isFullyPaid = newPaidInstallments === bill.installments;

    // 1. Actualiza la cuenta con la nueva cuota pagada
    const { error: updateError } = await supabase
      .from("cuentas_pendientes")
      .update({
        pagado: isFullyPaid,
        // Aquí almacenamos el nuevo valor de cuotas pagadas (suponiendo que lo agregas a la tabla)
        cuotas_pagadas: newPaidInstallments,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error actualizando cuota:", updateError);
      return;
    }

    // 2. Inserta una transacción de gasto en la tabla "transacciones"
    const bill_name = bill.name; // Guardar el nombre de la cuenta antes de la actualización
    const { error: transactionError } = await supabase.from("transacciones").insert([
      {
        usuario_id: 1, // 👈 estático por ahora
        tipo: "GASTO",
        monto: bill.installmentAmount,
        categoria: "Pago de Cuenta",
        descripcion: `PAGO DE CUOTA ${newPaidInstallments}/${bill.installments} PARA ${bill.name.toUpperCase()}`,
        fecha: new Date().toISOString(),
        cuenta_pendiente_id: id,
      },
    ]);

    if (transactionError) {
      console.error("Error creando transacción:", transactionError);
    }

    // 3. Refresca los datos
    fetchBills();
  };


  return { bills, loading, addBill, deleteBill, quickPayment };
}
