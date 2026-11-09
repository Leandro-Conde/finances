import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(
    body: Record<string, unknown>,
    status = 200,
) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
        },
    });
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return jsonResponse({ error: "Método não permitido." }, 405);
    }

    try {
        const authorization = req.headers.get("Authorization");

        if (!authorization?.startsWith("Bearer ")) {
            return jsonResponse({ error: "Sessão não informada." }, 401);
        }

        const token = authorization.slice("Bearer ".length);

        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!supabaseUrl || !anonKey || !serviceRoleKey) {
            throw new Error("Configuração interna do Supabase incompleta.");
        }

        // Cliente que valida a identidade apresentada pelo solicitante.
        const authClient = createClient(supabaseUrl, anonKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        });

        const {
            data: { user },
            error: authError,
        } = await authClient.auth.getUser(token);

        if (authError || !user) {
            return jsonResponse({ error: "Sessão inválida ou expirada." }, 401);
        }

        // Proteção principal: contas reais nunca podem usar esta exclusão.
        if (user.is_anonymous !== true) {
            return jsonResponse({
                error: "Esta operação é exclusiva para contas de teste.",
            }, 403);
        }

        const userId = user.id;

        // Cliente administrativo: utilizado somente dentro da Edge Function.
        const admin = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        });

        // Localiza arquivos e subpastas do usuário no bucket de avatares.
        async function collectAvatarFiles(
            folder: string,
        ): Promise<string[]> {
            const paths: string[] = [];
            const limit = 100;
            let offset = 0;

            while (true) {
                const { data, error } = await admin.storage
                    .from("avatars")
                    .list(folder, { limit, offset });

                if (error) throw error;

                for (const item of data ?? []) {
                    const itemPath = `${folder}/${item.name}`;

                    if (item.id === null) {
                        paths.push(
                            ...(await collectAvatarFiles(itemPath)),
                        );
                    } else {
                        paths.push(itemPath);
                    }
                }

                if (!data || data.length < limit) break;
                offset += data.length;
            }

            return paths;
        }

        const avatarFiles = await collectAvatarFiles(userId);

        // Remove os arquivos em lotes.
        for (let i = 0; i < avatarFiles.length; i += 100) {
            const batch = avatarFiles.slice(i, i + 100);

            const { error } = await admin.storage
                .from("avatars")
                .remove(batch);

            if (error) throw error;
        }

        // Exclui apenas os registros vinculados ao UUID autenticado.
        async function deleteUserRows(
            table: string,
            column = "user_id",
        ) {
            const { error } = await admin
                .from(table)
                .delete()
                .eq(column, userId);

            if (error) {
                throw new Error(
                    `Falha ao limpar ${table}: ${error.message}`,
                );
            }
        }

        // A exclusão de scheduled_bills também remove os lembretes
        // relacionados por ON DELETE CASCADE.
        await deleteUserRows("scheduled_bills");
        await deleteUserRows("transactions");
        await deleteUserRows("loans");
        await deleteUserRows("monthly_goals");
        await deleteUserRows("profiles", "id");
        await deleteUserRows("categories");
        await deleteUserRows("user_financial_balances");
        await deleteUserRows("user_financial_chart_history");
        await deleteUserRows("user_settings");

        // A identidade é excluída por último.
        const { error: deleteAuthError } =
            await admin.auth.admin.deleteUser(userId);

        if (deleteAuthError) {
            throw new Error(
                `Falha ao excluir a identidade de teste: ${deleteAuthError.message}`,
            );
        }

        return jsonResponse({
            success: true,
            message: "Conta de teste e dados removidos.",
        });
    } catch (error) {
        console.error("Erro em delete-demo-account:", error);

        return jsonResponse({
            error: error instanceof Error
                ? error.message
                : "Erro interno durante a exclusão.",
        }, 500);
    }
});