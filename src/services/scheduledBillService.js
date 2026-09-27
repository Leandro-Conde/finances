import { supabase } from "./supabase";

export async function getScheduledBills(userId) {
    const { data, error } = await supabase
        .from("scheduled_bills")
        .select("*")
        .eq("user_id", userId)
        .order("vencimento", { ascending: true });

    if (error) throw error;

    return data;
}

export async function createScheduledBill(bill) {
    const { data, error } = await supabase
        .from("scheduled_bills")
        .insert(bill)
        .select();

    if (error) throw error;

    return data[0];
}

export async function updateScheduledBill(id, values) {
    const { error } = await supabase
        .from("scheduled_bills")
        .update(values)
        .eq("id", id);

    if (error) throw error;
}

export async function deleteScheduledBill(id) {
    const { error } = await supabase
        .from("scheduled_bills")
        .delete()
        .eq("id", id);

    if (error) throw error;
}