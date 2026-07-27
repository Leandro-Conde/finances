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