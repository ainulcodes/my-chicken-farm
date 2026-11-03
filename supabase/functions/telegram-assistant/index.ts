import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

type TelegramUser = {
  id: number;
  first_name?: string;
  username?: string;
};

type TelegramChat = { id: number; type: string };

type TelegramMessage = {
  message_id: number;
  text?: string;
  from?: TelegramUser;
  chat: TelegramChat;
};

type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
};

type Indukan = {
  id: string;
  kode: string;
  nama?: string | null;
  marga?: string | null;
  jenis_kelamin?: string | null;
  ras?: string | null;
  warna?: string | null;
  tanggal_lahir?: string | null;
  status?: string | null;
};

type Breeding = {
  id: string;
  pejantan_id?: string | null;
  betina_id?: string | null;
  tanggal_kawin?: string | null;
  tanggal_menetas?: string | null;
  jumlah_anakan?: number | null;
  created_at?: string | null;
};

type Anakan = {
  id: string;
  breeding_id?: string | null;
  kode?: string | null;
  nama?: string | null;
  marga?: string | null;
  jenis_kelamin?: string | null;
  warna?: string | null;
  status?: string | null;
};

const TELEGRAM_API = "https://api.telegram.org";
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
  // Kompatibilitas untuk project yang masih memakai legacy service_role key.
  return requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
}

function allowedUserIds(): Set<number> {
  const raw = requiredEnv("ALLOWED_TELEGRAM_USER_IDS");
  const ids = raw.split(",").map((value) => Number(value.trim()));
  if (ids.some((id) => !Number.isSafeInteger(id))) {
    throw new Error(
      "ALLOWED_TELEGRAM_USER_IDS must contain comma-separated numeric IDs",
    );
  }
  return new Set(ids);
}

export function secureEqual(left: string, right: string): boolean {
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a[index] ^ b[index];
  }
  return result === 0;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export function splitTelegramText(text: string, maxLength = 4000): string[] {
  if (text.length <= maxLength) return [text];
  const parts: string[] = [];
  let remaining = text;
  while (remaining.length > maxLength) {
    let splitAt = remaining.lastIndexOf("\n", maxLength);
    if (splitAt < maxLength / 2) {
      splitAt = remaining.lastIndexOf(" ", maxLength);
    }
    if (splitAt < maxLength / 2) splitAt = maxLength;
    parts.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }
  if (remaining) parts.push(remaining);
  return parts;
}

async function sendTelegramMessage(
  chatId: number,
  text: string,
): Promise<void> {
  const token = requiredEnv("TELEGRAM_BOT_TOKEN");
  for (const part of splitTelegramText(text)) {
    const response = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: part }),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(
        `Telegram sendMessage failed (${response.status}): ${detail}`,
      );
    }
  }
}

export function dateInJakarta(date = new Date()): string {
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

export function addDays(date: string, days: number): string {
  // DATE Supabase tidak memiliki zona waktu. Perlakukan komponennya sebagai UTC
  // agar hasil tidak mundur sehari ketika diubah kembali ke ISO string.
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function nameOf(induk: Indukan | undefined): string {
  if (!induk) return "tidak diketahui";
  const identity = [induk.kode, induk.nama].filter(Boolean).join(" — ");
  return identity || induk.id;
}

async function fetchAll<T>(
  supabase: SupabaseClient,
  table: string,
  columns: string,
  limit = 500,
): Promise<T[]> {
  const { data, error } = await supabase.from(table).select(columns).limit(
    limit,
  );
  if (error) throw new Error(`Gagal membaca ${table}: ${error.message}`);
  return (data ?? []) as T[];
}

async function summary(supabase: SupabaseClient): Promise<string> {
  const [indukan, breeding, anakan] = await Promise.all([
    fetchAll<Indukan>(supabase, "ayam_induk", "id,kode,jenis_kelamin,status"),
    fetchAll<Breeding>(
      supabase,
      "breeding",
      "id,tanggal_menetas,jumlah_anakan",
    ),
    fetchAll<Anakan>(supabase, "ayam_anakan", "id,status,jenis_kelamin"),
  ]);
  const active = (status?: string | null) =>
    !/mati|dijual|afkir/i.test(status ?? "");
  const jantan = indukan.filter((row) =>
    /jantan/i.test(row.jenis_kelamin ?? "") && active(row.status)
  );
  const betina = indukan.filter((row) =>
    /betina/i.test(row.jenis_kelamin ?? "") && active(row.status)
  );
  const aliveChildren = anakan.filter((row) => active(row.status));
  const today = dateInJakarta();
  const nextWeek = addDays(today, 7);
  const hatchingSoon = breeding.filter((row) =>
    row.tanggal_menetas && row.tanggal_menetas >= today &&
    row.tanggal_menetas <= nextWeek
  );
  return [
    "Ringkasan peternakan:",
    `• Indukan: ${indukan.length} (${jantan.length} jantan aktif, ${betina.length} betina aktif)`,
    `• Breeding: ${breeding.length}`,
    `• Anakan: ${anakan.length} (${aliveChildren.length} aktif/hidup)`,
    `• Perkiraan menetas 7 hari ke depan: ${hatchingSoon.length}`,
  ].join("\n");
}

async function findIndukan(
  supabase: SupabaseClient,
  query: string,
): Promise<string> {
  const rows = await fetchAll<Indukan>(
    supabase,
    "ayam_induk",
    "id,kode,nama,marga,jenis_kelamin,ras,warna,tanggal_lahir,status",
  );
  const needle = query.trim().toLocaleLowerCase("id-ID");
  if (!needle) return "Gunakan: /indukan KODE atau /indukan NAMA";
  const matches = rows.filter((row) =>
    [row.kode, row.nama, row.marga, row.ras, row.warna, row.status]
      .some((value) => value?.toLocaleLowerCase("id-ID").includes(needle))
  ).slice(0, 10);
  if (!matches.length) {
    return `Indukan dengan kata kunci “${query.trim()}” tidak ditemukan.`;
  }
  return [
    `Ditemukan ${matches.length} indukan:`,
    ...matches.map((row) =>
      `• ${nameOf(row)} | ${row.jenis_kelamin ?? "-"} | ${row.ras ?? "-"} | ${
        row.status ?? "-"
      }`
    ),
  ].join("\n");
}

async function upcomingHatches(
  supabase: SupabaseClient,
  rawDays: string,
): Promise<string> {
  const parsed = Number.parseInt(rawDays, 10);
  const days = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 60) : 7;
  const today = dateInJakarta();
  const endDate = addDays(today, days);
  const [{ data, error }, indukan] = await Promise.all([
    supabase.from("breeding")
      .select(
        "id,pejantan_id,betina_id,tanggal_kawin,tanggal_menetas,jumlah_anakan",
      )
      .gte("tanggal_menetas", today)
      .lte("tanggal_menetas", endDate)
      .order("tanggal_menetas", { ascending: true })
      .limit(50),
    fetchAll<Indukan>(supabase, "ayam_induk", "id,kode,nama"),
  ]);
  if (error) throw new Error(`Gagal membaca breeding: ${error.message}`);
  const rows = (data ?? []) as Breeding[];
  if (!rows.length) {
    return `Tidak ada jadwal menetas dari ${today} sampai ${endDate}.`;
  }
  const byId = new Map(indukan.map((row) => [row.id, row]));
  return [
    `Jadwal menetas ${today} s.d. ${endDate}:`,
    ...rows.map((row) =>
      `• ${row.tanggal_menetas}: ${nameOf(byId.get(row.pejantan_id ?? ""))} × ${
        nameOf(byId.get(row.betina_id ?? ""))
      }`
    ),
  ].join("\n");
}

async function buildFarmContext(supabase: SupabaseClient): Promise<string> {
  const [indukan, breeding, anakan] = await Promise.all([
    fetchAll<Indukan>(
      supabase,
      "ayam_induk",
      "id,kode,nama,marga,jenis_kelamin,ras,warna,tanggal_lahir,status",
    ),
    fetchAll<Breeding>(
      supabase,
      "breeding",
      "id,pejantan_id,betina_id,tanggal_kawin,tanggal_menetas,jumlah_anakan,created_at",
    ),
    fetchAll<Anakan>(
      supabase,
      "ayam_anakan",
      "id,breeding_id,kode,nama,marga,jenis_kelamin,warna,status",
    ),
  ]);
  return JSON.stringify({
    tanggal_wib: dateInJakarta(),
    indukan,
    breeding,
    anakan,
  });
}

async function askGemini(
  question: string,
  farmContext: string,
): Promise<string> {
  const apiKey = Deno.env.get("GEMINI_API_KEY")?.trim();
  if (!apiKey) {
    return "Pertanyaan bebas membutuhkan GEMINI_API_KEY. Perintah /ringkasan, /indukan, dan /menetas tetap dapat digunakan tanpa AI.";
  }
  const model = Deno.env.get("GEMINI_MODEL")?.trim() || "gemini-3.8-flash";
  const prompt = [
    "Anda adalah asisten read-only peternakan ayam. Jawab dalam Bahasa Indonesia yang ringkas.",
    "Gunakan HANYA data JSON yang diberikan. Jangan mengarang data atau mengklaim telah mengubah database.",
    "Jika data tidak cukup, katakan dengan jelas. Untuk saran kesehatan, beri pengingat agar berkonsultasi dengan dokter hewan.",
    `Pertanyaan pengguna: ${question}`,
    `Data peternakan: ${farmContext}`,
  ].join("\n\n");
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${
      encodeURIComponent(model)
    }:generateContent`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 800 },
      }),
    },
  );
  if (!response.ok) {
    const detail = await response.text();
    console.error("Gemini request failed", response.status, detail);
    return "Layanan AI sedang tidak tersedia. Coba /ringkasan, /indukan, atau /menetas.";
  }
  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text ?? "")
    .join("")
    .trim();
  return text || "AI tidak menghasilkan jawaban. Silakan ubah pertanyaannya.";
}

const HELP = [
  "Asisten My Chicken Farm (read-only)",
  "",
  "/ringkasan — statistik peternakan",
  "/indukan KODE/NAMA — cari indukan",
  "/menetas [hari] — jadwal menetas (default 7 hari, maksimal 60)",
  "/id — tampilkan Telegram user ID",
  "/help — bantuan",
  "",
  "Anda juga dapat bertanya dengan bahasa biasa jika Gemini sudah dikonfigurasi.",
].join("\n");

async function answer(
  supabase: SupabaseClient,
  text: string,
  userId: number,
): Promise<string> {
  const [rawCommand, ...args] = text.trim().split(/\s+/);
  const command = rawCommand.toLowerCase().split("@")[0];
  if (command === "/start" || command === "/help") return HELP;
  if (command === "/id") return `Telegram user ID Anda: ${userId}`;
  if (command === "/ringkasan") return await summary(supabase);
  if (command === "/indukan") {
    return await findIndukan(supabase, args.join(" "));
  }
  if (command === "/menetas") {
    return await upcomingHatches(supabase, args[0] ?? "7");
  }
  if (command.startsWith("/")) return `Perintah tidak dikenal.\n\n${HELP}`;
  return await askGemini(text, await buildFarmContext(supabase));
}

export async function handleRequest(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  try {
    const expectedSecret = requiredEnv("TELEGRAM_WEBHOOK_SECRET");
    const receivedSecret =
      request.headers.get("x-telegram-bot-api-secret-token") ?? "";
    if (!secureEqual(receivedSecret, expectedSecret)) {
      return jsonResponse({ error: "unauthorized" }, 401);
    }

    const update = await request.json() as TelegramUpdate;
    const message = update.message;
    if (!message?.text || !message.from) {
      return jsonResponse({ ok: true, ignored: true });
    }

    const allowed = allowedUserIds();
    if (message.chat.type !== "private" || !allowed.has(message.from.id)) {
      console.warn(
        "Rejected Telegram user",
        message.from.id,
        message.chat.type,
      );
      return jsonResponse({ ok: true, ignored: true });
    }

    const supabase = createClient(
      requiredEnv("SUPABASE_URL"),
      supabaseAdminKey(),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const responseText = await answer(supabase, message.text, message.from.id);
    await sendTelegramMessage(message.chat.id, responseText);
    return jsonResponse({ ok: true });
  } catch (error) {
    console.error("telegram-assistant error", error);
    // Status 200 mencegah Telegram mengulang update yang sama terus-menerus.
    return jsonResponse({ ok: false });
  }
}

if (import.meta.main) Deno.serve(handleRequest);
