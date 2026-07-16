import { supabase } from "./supabase";

export async function getLoans(userId) {

    const { data, error } = await supabase

        .from("loans")
        .select("*")
        .eq("user_id", userId)
        .order("vencimento", { ascending: true });

    if (error) throw error;

    return data;

}

export async function createLoan(loan) {

    const { data, error } = await supabase

        .from("loans")
        .insert(loan)
        .select();

    if (error) throw error;

    return data[0];

}

export async function updateLoan(id, values) {

    const { error } = await supabase

        .from("loans")
        .update(values)
        .eq("id", id);

    if (error) throw error;

}

export async function deleteLoan(id) {

    const { error } = await supabase

        .from("loans")
        .delete()
        .eq("id", id);

    if (error) throw error;

}