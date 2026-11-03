import { createClient } from "npm:@supabase/supabase-js@2";

type Breeding = {
  id: string;
  pejantan_id: string | null;
  betina_id: string | null;
  tanggal_menetas: string;
};

type Indukan = { id: string; kode: string; nama: string | null };

const REMINDER_DAYS = [7, 3, 1, 0] as const;
const encoder = new TextEncoder();

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`Missing required secret: ${name}`);
  return value;
}

function supabaseAdminKey(): string {
  const keys = Deno.env.get("SUPABASE_SECRET_KEYS")?.trim();
  if (keys) {
    const parsed = JSON.parse(keys) as Record<string, string>;
    if (parsed.default) return parsed.default;
  }
  return requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
}

function secureEqual(left: string, right: string): boolean {
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a[index] ^ b[index];
  }
  return result === 0;
}

function dateInJakarta(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function addDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function chatIds(): number[] {
  const raw = Deno.env.get("TELEGRAM_NOTIFICATION_CHAT_IDS")?.trim() ||
    requiredEnv("ALLOWED_TELEGRAM_USER_IDS");
  const ids = raw.split(",").map((value) => Number(value.trim()));
  if (ids.some((id) => !Number.isSafeInteger(id))) {
    throw new Error("Telegram chat IDs must be comma-separated integers");
  }
  return [...new Set(ids)];
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(
    ">",
    "&gt;",
  );
}

function chickenName(induk: Indukan | undefined): string {
  if (!induk) return "tidak diketahui";
  return escapeHtml(
    [induk.kode, induk.nama].filter(Boolean).join(" — ") || induk.id,
  );
}

function reminderLabel(days: number): string {
  return days === 0 ? "Hari-H" : `H-${days}`;
}

async function sendTelegram(chatId: number, text: string): Promise<void> {
  const response = await fetch(
    `https://api.telegram.org/bot${
      requiredEnv("TELEGRAM_BOT_TOKEN")
    }/sendMessage`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    },
  );
  if (!response.ok) {
    throw new Error(`Telegram ${response.status}: ${await response.text()}`);
  }
}

export async function handleRequest(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ error: "method_not_allowed" }, { status: 405 });
  }
  const received = request.headers.get("x-cron-secret") ?? "";
  if (!secureEqual(received, requiredEnv("REMINDER_CRON_SECRET"))) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createClient(
      requiredEnv("SUPABASE_URL"),
      supabaseAdminKey(),
      {
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
    const today = dateInJakarta();
    const dateToDays = new Map(
      REMINDER_DAYS.map((days) => [addDays(today, days), days]),
    );
    const { data: breedingData, error: breedingError } = await supabase
      .from("breeding")
      .select("id,pejantan_id,betina_id,tanggal_menetas")
      .in("tanggal_menetas", [...dateToDays.keys()]);
    if (breedingError) throw breedingError;
    const breedings = (breedingData ?? []) as Breeding[];

    const parentIds = [
      ...new Set(
        breedings.flatMap((row) =>
          [row.pejantan_id, row.betina_id].filter((id): id is string =>
            Boolean(id)
          )
        ),
      ),
    ];
    let parents: Indukan[] = [];
    if (parentIds.length) {
      const { data, error } = await supabase.from("ayam_induk").select(
        "id,kode,nama",
      ).in("id", parentIds);
      if (error) throw error;
      parents = (data ?? []) as Indukan[];
    }
    const parentById = new Map(parents.map((row) => [row.id, row]));

    let sent = 0;
    let skipped = 0;
    const errors: string[] = [];
    for (const breeding of breedings) {
      const days = dateToDays.get(breeding.tanggal_menetas);
      if (days === undefined) continue;
      for (const chatId of chatIds()) {
        const { data: reservation, error: reservationError } = await supabase
          .from("telegram_notification_log")
          .insert({
            breeding_id: breeding.id,
            hatch_date: breeding.tanggal_menetas,
            reminder_days: days,
            chat_id: chatId,
          })
          .select("id")
          .single();
        if (reservationError?.code === "23505") {
          skipped += 1;
          continue;
        }
        if (reservationError) throw reservationError;

        const text = [
          `🐣 <b>Pengingat Menetas ${reminderLabel(days)}</b>`,
          `Tanggal menetas: <b>${breeding.tanggal_menetas}</b>`,
          `Pejantan: ${
            chickenName(parentById.get(breeding.pejantan_id ?? ""))
          }`,
          `Betina: ${chickenName(parentById.get(breeding.betina_id ?? ""))}`,
        ].join("\n");
        try {
          await sendTelegram(chatId, text);
          sent += 1;
        } catch (error) {
          await supabase.from("telegram_notification_log").delete().eq(
            "id",
            reservation.id,
          );
          const message = error instanceof Error
            ? error.message
            : String(error);
          errors.push(`${breeding.id}/${chatId}: ${message}`);
        }
      }
    }

    return Response.json({
      ok: errors.length === 0,
      date: today,
      matched: breedings.length,
      sent,
      skipped,
      errors,
    });
  } catch (error) {
    console.error("hatch-reminders error", error);
    return Response.json({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

if (import.meta.main) Deno.serve(handleRequest);
