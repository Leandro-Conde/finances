
import { supabase } from "./supabase";

const LIMITE_PADRAO = 3000;

export async function getUserSettings(userId) {
    const { data, error } = await supabase
        .from("user_settings")
        .select("limite_gastos")
        .eq("user_id", userId)
        .maybeSingle();

    if (error) throw error;

    if (data) {
        return Number(data.limite_gastos);
    }

    return LIMITE_PADRAO;
}

export async function saveSpendingLimit(userId, limite) {
    const valor = Number(limite);

    if (!Number.isFinite(valor) || valor <= 0) {
        throw new Error("O limite precisa ser maior que zero.");
    }

    const { error } = await supabase
        .from("user_settings")
        .upsert(
            {
                user_id: userId,
                limite_gastos: valor,
                updated_at: new Date().toISOString(),
            },
            {
                onConflict: "user_id",
            }
        );

    if (error) throw error;

    return valor;
}
