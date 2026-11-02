
import { supabase } from "./supabase";

export async function getTransactions(userId) {
    const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("data", { ascending: false });

    if (error) throw error;
    return data;
}

export async function createTransaction(transaction) {
    const { data, error } = await supabase
        .from("transactions")
        .insert(transaction)
        .select();

    if (error) throw error;
    return data[0];
}

export async function updateTransaction(id, values) {
    const { error } = await supabase
        .from("transactions")
        .update(values)
        .eq("id", id);

    if (error) throw error;
}

export async function deleteTransaction(id) {
    const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

    if (error) throw error;
}

export async function createTransactions(transactions) {
    const { data, error } = await supabase
        .from("transactions")
        .insert(transactions)
        .select();

    if (error) throw error;
    return data;
}

/**
 * Conta quantas transações seriam removidas.
 * meses = 1, 2, 3... para limpar transações antigas.
 * meses = "todos" para contar todas.
 */
export async function countTransactionsToClean(userId, meses) {
  if (!userId) {
      throw new Error("Usuário não autenticado.");
  }

  const months =
      meses === "todos" ? null : Number(meses);

  if (
      months !== null &&
      (!Number.isInteger(months) || months < 1)
  ) {
      throw new Error("O período deve ser de pelo menos 1 mês.");
  }

  const { data, error } = await supabase.rpc(
      "count_transaction_history",
      { p_months: months }
  );

  if (error) throw error;

  return Number(data ?? 0);
}

export async function getPreservedChartHistory(userId) {
    if (!userId) {
        throw new Error("Usuário não autenticado.");
    }

    const { data, error } = await supabase
        .from("user_financial_chart_history")
        .select(
            "data, entrada, saida, investimento, valor_guardado_utilizado"
        )
        .eq("user_id", userId)
        .order("data", { ascending: true });

    if (error) throw error;

    return data ?? [];
}

/**
 * Lê os valores acumulados após limpezas anteriores.
 */

export async function getPreservedFinancialBalances(userId) {
    if (!userId) {
      throw new Error("Usuário não autenticado.");
    }
  
    const { data, error } = await supabase
      .from("user_financial_balances")
      .select(
        "saldo_base, investimentos_base, valor_guardado_utilizado_base"
      )
      .eq("user_id", userId)
      .maybeSingle();
  
    if (error) {
      throw error;
    }
  
    return {
      saldoBase: Number(data?.saldo_base ?? 0),
      investimentosBase: Number(data?.investimentos_base ?? 0),
      valorGuardadoUtilizadoBase: Number(
        data?.valor_guardado_utilizado_base ?? 0
      ),
    };
  }
  

/**
 * Limpa o histórico por meio da função SQL transacional.
 * months = 1, 2, 3... para limpar transações antigas.
 * months = null para limpar todo o histórico.
 */
export async function cleanTransactionHistory(months = null) {
    if (
        months !== null &&
        (!Number.isInteger(months) || months < 1)
    ) {
        throw new Error("O período deve ser de pelo menos 1 mês.");
    }

    const { data, error } = await supabase.rpc(
        "clean_transaction_history",
        { p_months: months }
    );

    if (error) throw error;

    return data?.[0] ?? null;
}
