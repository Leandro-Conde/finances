import { supabase } from "./supabase";

export async function getCategories(userId) {
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .or(`user_id.eq.${userId},user_id.is.null`)
        .order("nome");

    if (error) throw error;

    return data;
}

export async function createCategory(category) {
    const { data, error } = await supabase
        .from("categories")
        .insert(category)
        .select();

    if (error) throw error;

    return data[0];
}

export async function deleteCategory(id) {
    const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

    if (error) throw error;
}

export async function updateCategory(id, values) {
    const { error } = await supabase
        .from("categories")
        .update(values)
        .eq("id", id);

    if (error) throw error;
}