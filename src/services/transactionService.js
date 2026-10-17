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
 * Conta as transações que seriam removidas.
 * meses = 1, 2, 3... para limpar o histórico antigo.
 * meses = "todos" para contar todas as transações.
 */
export async function countTransactionsToClean(userId, meses) {
    if (!userId) {
      throw new Error("Usuário não autenticado.");
    }
  
    let query = supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
  
    if (meses !== "todos") {
      const dataLimite = new Date();
      dataLimite.setMonth(dataLimite.getMonth() - Number(meses));
  
      const dataISO = [
        dataLimite.getFullYear(),
        String(dataLimite.getMonth() + 1).padStart(2, "0"),
        String(dataLimite.getDate()).padStart(2, "0"),
      ].join("-");
  
      query = query.lt("data", dataISO);
    }
  
    const { count, error } = await query;
  
    if (error) throw error;
  
    return count ?? 0;
  }
  
  /**
   * Exclui transações antigas ou todo o histórico
   * apenas do usuário informado.
   */
  export async function cleanTransactionHistory(userId, meses) {
    if (!userId) {
      throw new Error("Usuário não autenticado.");
    }
  
    let query = supabase
      .from("transactions")
      .delete()
      .eq("user_id", userId);
  
    if (meses !== "todos") {
      const dataLimite = new Date();
      dataLimite.setMonth(dataLimite.getMonth() - Number(meses));
  
      const dataISO = [
        dataLimite.getFullYear(),
        String(dataLimite.getMonth() + 1).padStart(2, "0"),
        String(dataLimite.getDate()).padStart(2, "0"),
      ].join("-");
  
      query = query.lt("data", dataISO);
    }
  
    const { error } = await query;
  
    if (error) throw error;
  }
  