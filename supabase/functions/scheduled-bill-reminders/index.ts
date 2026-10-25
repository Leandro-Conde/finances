
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL =
  Deno.env.get("RESEND_FROM_EMAIL") ?? "Atlas Finance <onboarding@resend.dev>";

const TIME_ZONE = "America/Sao_Paulo";

type ReminderType = "day_before" | "due_day";

type Bill = {
  id: string;
  user_id: string;
  nome: string;
  categoria: string | null;
  valor: number | string;
  tipo: string;
  vencimento: string;
  recorrencia: string;
  dias_lembrete: number;
  ativo: boolean;
};

function dateInBrazil(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function addDays(date: string, amount: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + amount));

  return result.toISOString().slice(0, 10);
}

function monthlyOccurrence(
  originalDate: string,
  year: number,
  month: number,
): string {
  const originalDay = Number(originalDate.slice(8, 10));
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const day = Math.min(originalDay, lastDay);

  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function getDueDates(bill: Bill, today: string): string[] {
  if (bill.recorrencia !== "mensal") {
    return [bill.vencimento];
  }

  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));

  return [
    monthlyOccurrence(bill.vencimento, year, month),
    monthlyOccurrence(
      bill.vencimento,
      month === 12 ? year + 1 : year,
      month === 12 ? 1 : month + 1,
    ),
  ];
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

function formatCurrency(value: number | string): string {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

async function sendEmail(
  recipient: string,
  bill: Bill,
  dueDate: string,
  reminderType: ReminderType,
): Promise<string> {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY não está configurada.");
  }

  const isDueDay = reminderType === "due_day";
  const safeName = escapeHtml(bill.nome);
  const safeDate = escapeHtml(
    dueDate.split("-").reverse().join("/"),
  );
  const safeValue = escapeHtml(formatCurrency(bill.valor));

  const subject = isDueDay
    ? `Vence hoje: ${bill.nome}`
    : `Lembrete: ${bill.nome} vence amanhã`;

  const message = isDueDay
    ? "Esta conta vence hoje. Confira seu planejamento financeiro."
    : "Esta conta vence amanhã. Aproveite para se organizar com antecedência.";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [recipient],
      subject,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#222">
          <h1 style="color:#16a34a">Atlas Finance</h1>
          <h2>${isDueDay ? "Conta vence hoje" : "Conta vence amanhã"}</h2>
          <p>Olá! Este é seu lembrete financeiro.</p>
          <p>${message}</p>
          <div style="padding:16px;background:#f5f5f5;border-radius:8px">
            <p><strong>Conta:</strong> ${safeName}</p>
            <p><strong>Valor:</strong> ${safeValue}</p>
            <p><strong>Vencimento:</strong> ${safeDate}</p>
          </div>
          <p>Organize suas finanças com o Atlas Finance.</p>
        </div>
      `,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      `Resend (${response.status}): ${
        result.message ?? "Falha ao enviar e-mail."
      }`,
    );
  }

  if (!result.id) {
    throw new Error("O Resend não retornou o identificador do e-mail.");
  }

  return result.id as string;
}

export default {
  fetch: withSupabase(
    { auth: "secret" },
    async (req, ctx) => {
      if (req.method !== "POST") {
        return Response.json(
          { error: "Método não permitido." },
          { status: 405 },
        );
      }

      if (!RESEND_API_KEY) {
        return Response.json(
          { error: "O segredo RESEND_API_KEY não está configurado." },
          { status: 500 },
        );
      }

      const supabase = ctx.supabaseAdmin;
      const today = dateInBrazil();
      const url = new URL(req.url);
      const dryRun = url.searchParams.get("dry_run") === "true";
      const tomorrow = addDays(today, 1);

      const { data: bills, error: billsError } = await supabase
        .from("scheduled_bills")
        .select(
          "id,user_id,nome,categoria,valor,tipo,vencimento,recorrencia,dias_lembrete,ativo",
        )
        .eq("ativo", true);

      if (billsError) {
        console.error("Erro ao consultar contas:", billsError.message);

        return Response.json(
          { error: "Não foi possível consultar as contas agendadas." },
          { status: 500 },
        );
      }

      let sent = 0;
      let skipped = 0;
      let failed = 0;
      let wouldSend = 0;

      for (const bill of (bills ?? []) as Bill[]) {
        const dueDates = getDueDates(bill, today);

        for (const dueDate of dueDates) {
          let reminderType: ReminderType | null = null;

          if (dueDate === today) {
            reminderType = "due_day";
          } else if (dueDate === tomorrow) {
            reminderType = "day_before";
          }

          if (!reminderType) continue;

          if (dryRun) {
            wouldSend++;
            console.log(
              `[SIMULAÇÃO] Conta: ${bill.id}; vencimento: ${dueDate}; aviso: ${reminderType}`,
            );
            continue;
          }

        let reminderId: string | null = null;

          try {
            const { data: existing, error: lookupError } = await supabase
              .from("scheduled_bill_reminders")
              .select("id,status")
              .eq("bill_id", bill.id)
              .eq("due_date", dueDate)
              .eq("reminder_type", reminderType)
              .maybeSingle();

            if (lookupError) throw lookupError;

            if (existing?.status === "sent" ||
                existing?.status === "pending") {
              skipped++;
              continue;
            }

            if (existing) {
              const { error: updateError } = await supabase
                .from("scheduled_bill_reminders")
                .update({
                  status: "pending",
                  error_message: null,
                  sent_at: null,
                })
                .eq("id", existing.id)
                .eq("status", "failed");

              if (updateError) throw updateError;

              reminderId = existing.id;
            } else {
              const { data: inserted, error: insertError } = await supabase
                .from("scheduled_bill_reminders")
                .insert({
                  bill_id: bill.id,
                  due_date: dueDate,
                  reminder_type: reminderType,
                  status: "pending",
                  sent_at: null,
                  error_message: null,
                })
                .select("id")
                .single();

              if (insertError) {
                if (insertError.code === "23505") {
                  skipped++;
                  continue;
                }

                throw insertError;
              }

              reminderId = inserted.id;
            }

            const { data: authData, error: authError } =
              await supabase.auth.admin.getUserById(bill.user_id);

            if (authError) throw authError;

            const recipient = authData.user?.email;

            if (!recipient) {
              throw new Error("O usuário não possui e-mail cadastrado.");
            }

            const providerMessageId = await sendEmail(
              recipient,
              bill,
              dueDate,
              reminderType,
            );

            const { error: markSentError } = await supabase
              .from("scheduled_bill_reminders")
              .update({
                status: "sent",
                sent_at: new Date().toISOString(),
                error_message: null,
                provider_message_id: providerMessageId,
              })
              .eq("id", reminderId);

            if (markSentError) throw markSentError;

            sent++;
          } catch (error) {
            failed++;

            const message = error instanceof Error
              ? error.message
              : "Erro desconhecido.";

            console.error(
              `Falha no lembrete da conta ${bill.id}:`,
              message,
            );

            if (reminderId) {
              const { error: markFailedError } = await supabase
                .from("scheduled_bill_reminders")
                .update({
                  status: "failed",
                  error_message: message.slice(0, 1000),
                })
                .eq("id", reminderId);

              if (markFailedError) {
                console.error(
                  "Falha ao registrar erro:",
                  markFailedError.message,
                );
              }
            }
          }
        }
      }

      return Response.json({
        date: today,
        wouldSend,
        sent,
        skipped,
        failed,
      });
    },
  ),
};
