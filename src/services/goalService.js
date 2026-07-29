import { supabase } from "./supabase";

export async function getGoal(userId) {

    const { data, error } = await supabase
        .from("monthly_goals")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (error && error.code !== "PGRST116") throw error;

    return data;
}

export async function createGoal(goal) {

    const { data, error } = await supabase
        .from("monthly_goals")
        .insert(goal)
        .select();

    if (error) throw error;

    return data[0];
}

export async function updateGoal(id, values) {

    const { error } = await supabase
        .from("monthly_goals")
        .update(values)
        .eq("id", id);

    if (error) throw error;
}

export async function deleteGoal(id) {

    const { error } = await supabase
        .from("monthly_goals")
        .delete()
        .eq("id", id);

    if (error) throw error;
}