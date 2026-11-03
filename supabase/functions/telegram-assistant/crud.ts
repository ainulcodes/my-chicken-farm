import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export type InlineKeyboard = {
  inline_keyboard: Array<Array<{ text: string; callback_data: string }>>;
};

export type CrudReply = { text: string; replyMarkup?: InlineKeyboard };

export type NaturalCrudIntent = {
  operation?: "insert" | "update" | "delete";
  entity?: "indukan" | "breeding" | "anakan";
  identifier?: string | null;
  values?: Record<string, unknown>;
  confidence?: number;
  clarification?: string | null;
};

type EntityConfig = {
  table: string;
  label: string;
  fields: Set<string>;
  requiredOnAdd: string[];
  identifierColumn?: string;
  numberFields?: Set<string>;
  dateFields?: Set<string>;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ENTITIES: Record<string, EntityConfig> = {
  indukan: {
    table: "ayam_induk",
    label: "indukan",
    identifierColumn: "kode",
    fields: new Set([
      "kode",
      "nama",
      "marga",
      "jenis_kelamin",
      "ras",
      "warna",
      "tanggal_lahir",
      "status",
    ]),
    requiredOnAdd: ["kode"],
    dateFields: new Set(["tanggal_lahir"]),
  },
  anakan: {
    table: "ayam_anakan",
    label: "anakan",
    identifierColumn: "kode",
    fields: new Set([
      "breeding_id",
      "kode",
      "nama",
      "marga",
      "jenis_kelamin",
      "warna",
      "status",
    ]),
    requiredOnAdd: ["kode"],
  },
  breeding: {
    table: "breeding",
    label: "breeding",
    fields: new Set([
      "pejantan_id",
      "betina_id",
      "tanggal_kawin",
      "tanggal_menetas",
      "jumlah_anakan",
    ]),
    requiredOnAdd: ["pejantan_id", "betina_id", "tanggal_kawin"],
    numberFields: new Set(["jumlah_anakan"]),
    dateFields: new Set(["tanggal_kawin", "tanggal_menetas"]),
  },
};

const FIELD_ALIASES: Record<string, string> = {
  jk: "jenis_kelamin",
  lahir: "tanggal_lahir",
  kawin: "tanggal_kawin",
  menetas: "tanggal_menetas",
  jumlah: "jumlah_anakan",
  pejantan: "pejantan_id",
  betina: "betina_id",
  breeding: "breeding_id",
};

export const CRUD_HELP = [
  "Kelola data melalui Telegram:",
  "",
  "/tambah indukan kode=PJ-01 nama=Jago jk=Jantan warna=Merah status=Sehat",
  "/ubah indukan PJ-01 warna=Hitam status=Sehat",
  "/hapus indukan PJ-01",
  "",
  "/tambah breeding pejantan=PJ-01 betina=BT-01 kawin=2026-11-03 menetas=2026-11-24 jumlah=0",
  "/ubah breeding UUID jumlah=8",
  "/hapus breeding UUID",
  "",
  "/tambah anakan kode=AN-01 nama=Anak jk=Betina warna=Putih status=Sehat",
  "/ubah anakan AN-01 status=Mati",
  "/hapus anakan AN-01",
  "",
  'Gunakan tanda kutip untuk nilai dengan spasi: nama="Jago Merah".',
  "Gunakan nilai null untuk mengosongkan field opsional.",
].join("\n");

export function parseKeyValues(input: string): Record<string, string> {
  const values: Record<string, string> = {};
  const pattern = /([a-zA-Z_][\w]*)=(?:"([^"]*)"|'([^']*)'|([^\s]+))/g;
  for (const match of input.matchAll(pattern)) {
    const rawKey = match[1].toLowerCase();
    const key = FIELD_ALIASES[rawKey] ?? rawKey;
    values[key] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return values;
}

function coerceValues(
  config: EntityConfig,
  raw: Record<string, string>,
): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const [field, value] of Object.entries(raw)) {
    if (!config.fields.has(field)) {
      throw new Error(`Field tidak diizinkan: ${field}`);
    }
    if (value.toLowerCase() === "null") {
      output[field] = null;
    } else if (config.numberFields?.has(field)) {
      const number = Number(value);
      if (!Number.isInteger(number) || number < 0) {
        throw new Error(`${field} harus bilangan bulat >= 0`);
      }
      output[field] = number;
    } else if (config.dateFields?.has(field)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new Error(`${field} harus YYYY-MM-DD`);
      }
      output[field] = value;
    } else {
      output[field] = value.trim();
    }
  }
  return output;
}

function stringifyIntentValues(values: Record<string, unknown>): string {
  return Object.entries(values)
    .map(([key, value]) => `${key}=${value === null ? "null" : String(value)}`)
    .join(", ");
}

async function resolveParentCodes(
  supabase: SupabaseClient,
  values: Record<string, unknown>,
): Promise<void> {
  for (const field of ["pejantan_id", "betina_id"] as const) {
    const value = values[field];
    if (typeof value !== "string" || UUID_PATTERN.test(value)) continue;
    const expectedSex = field === "pejantan_id" ? "Jantan" : "Betina";
    const { data, error } = await supabase.from("ayam_induk")
      .select("id,kode,jenis_kelamin")
      .eq("kode", value)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      throw new Error(
        `Kode ${
          field === "pejantan_id" ? "pejantan" : "betina"
        } ${value} tidak ditemukan`,
      );
    }
    if (
      data.jenis_kelamin &&
      data.jenis_kelamin.toLowerCase() !== expectedSex.toLowerCase()
    ) {
      throw new Error(`${value} bukan indukan ${expectedSex.toLowerCase()}`);
    }
    values[field] = data.id;
  }
}

async function resolveRecord(
  supabase: SupabaseClient,
  config: EntityConfig,
  identifier: string,
) {
  let query = supabase.from(config.table).select("*");
  query = UUID_PATTERN.test(identifier)
    ? query.eq("id", identifier)
    : config.identifierColumn
    ? query.eq(config.identifierColumn, identifier)
    : query.eq("id", identifier);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`${config.label} “${identifier}” tidak ditemukan`);
  return data as Record<string, unknown>;
}

function describe(
  record: Record<string, unknown>,
  config: EntityConfig,
): string {
  return String(record.kode ?? record.id ?? config.label);
}

async function deletionImpact(
  supabase: SupabaseClient,
  config: EntityConfig,
  recordId: string,
): Promise<string> {
  if (config.table === "breeding") {
    const { count, error } = await supabase.from("ayam_anakan")
      .select("id", { count: "exact", head: true }).eq(
        "breeding_id",
        recordId,
      );
    if (error) throw error;
    return count ? `\n⚠️ ${count} anakan terkait juga akan terhapus.` : "";
  }
  if (config.table === "ayam_induk") {
    const { count, error } = await supabase.from("breeding")
      .select("id", { count: "exact", head: true })
      .or(`pejantan_id.eq.${recordId},betina_id.eq.${recordId}`);
    if (error) throw error;
    return count
      ? `\nℹ️ Referensi indukan pada ${count} breeding akan dikosongkan.`
      : "";
  }
  return "";
}

export async function processCrudCommand(
  supabase: SupabaseClient,
  text: string,
  userId: number,
  chatId: number,
): Promise<CrudReply | null> {
  const match = text.trim().match(
    /^\/(tambah|ubah|hapus)(?:@\w+)?\s+(\w+)(?:\s+([^\s]+))?(?:\s+([\s\S]*))?$/i,
  );
  if (!match) {
    if (/^\/(tambah|ubah|hapus)(?:@\w+)?\b/i.test(text)) {
      return { text: CRUD_HELP };
    }
    return null;
  }
  const operation = match[1].toLowerCase();
  const entityName = match[2].toLowerCase();
  const config = ENTITIES[entityName];
  if (!config) {
    return { text: `Jenis data tidak dikenal: ${entityName}\n\n${CRUD_HELP}` };
  }

  try {
    if (operation === "tambah") {
      const valuesInput = [match[3], match[4]].filter(Boolean).join(" ");
      const values = coerceValues(config, parseKeyValues(valuesInput));
      const missing = config.requiredOnAdd.filter((field) =>
        values[field] === undefined || values[field] === ""
      );
      if (missing.length) throw new Error(`Field wajib: ${missing.join(", ")}`);
      await resolveParentCodes(supabase, values);
      const { data, error } = await supabase.from(config.table).insert(values)
        .select().single();
      if (error) throw error;
      return {
        text: `✅ ${config.label} ${
          describe(data, config)
        } berhasil ditambahkan.`,
      };
    }

    const identifier = match[3];
    if (!identifier) throw new Error(`Identifier ${config.label} wajib diisi`);
    const record = await resolveRecord(supabase, config, identifier);

    if (operation === "ubah") {
      const values = coerceValues(config, parseKeyValues(match[4] ?? ""));
      if (!Object.keys(values).length) {
        throw new Error("Tidak ada field yang akan diubah");
      }
      await resolveParentCodes(supabase, values);
      const { error } = await supabase.from(config.table).update(values).eq(
        "id",
        record.id,
      );
      if (error) throw error;
      return {
        text: `✅ ${config.label} ${
          describe(record, config)
        } berhasil diperbarui.`,
      };
    }

    const impact = await deletionImpact(
      supabase,
      config,
      String(record.id),
    );
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { data: pending, error } = await supabase.from(
      "telegram_pending_actions",
    ).insert({
      action: "delete",
      table_name: config.table,
      record_id: record.id,
      record_label: describe(record, config),
      requested_by: userId,
      chat_id: chatId,
      expires_at: expiresAt,
    }).select("id").single();
    if (error) throw error;
    return {
      text: `⚠️ Hapus ${config.label} ${
        describe(record, config)
      }? Tindakan ini tidak dapat dibatalkan.${impact}`,
      replyMarkup: {
        inline_keyboard: [[
          {
            text: "🗑 Konfirmasi Hapus",
            callback_data: `crud:confirm:${pending.id}`,
          },
          { text: "Batal", callback_data: `crud:cancel:${pending.id}` },
        ]],
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { text: `❌ ${message}` };
  }
}

export async function processNaturalCrudIntent(
  supabase: SupabaseClient,
  intent: NaturalCrudIntent,
  userId: number,
  chatId: number,
): Promise<CrudReply> {
  try {
    if (intent.clarification) {
      return { text: `Saya perlu klarifikasi: ${intent.clarification}` };
    }
    if (
      !intent.operation ||
      !["insert", "update", "delete"].includes(intent.operation) ||
      !intent.entity || !Object.hasOwn(ENTITIES, intent.entity)
    ) throw new Error("Maksud operasi atau jenis data belum jelas");
    if ((intent.confidence ?? 0) < 0.7) {
      throw new Error(
        "Permintaan masih ambigu. Sebutkan aksi, jenis data, dan kode dengan jelas",
      );
    }
    const config = ENTITIES[intent.entity];
    const rawValues: Record<string, string> = {};
    for (const [rawKey, rawValue] of Object.entries(intent.values ?? {})) {
      const key = FIELD_ALIASES[rawKey.toLowerCase()] ?? rawKey.toLowerCase();
      rawValues[key] = rawValue === null ? "null" : String(rawValue);
    }
    const values = coerceValues(config, rawValues);
    await resolveParentCodes(supabase, values);

    let record: Record<string, unknown> | null = null;
    if (intent.operation !== "insert") {
      if (!intent.identifier) {
        throw new Error(`Kode/UUID ${config.label} wajib disebutkan`);
      }
      record = await resolveRecord(supabase, config, intent.identifier);
    }
    if (intent.operation === "insert") {
      const missing = config.requiredOnAdd.filter((field) =>
        values[field] === undefined || values[field] === ""
      );
      if (missing.length) {
        throw new Error(
          `Data belum lengkap. Field wajib: ${missing.join(", ")}`,
        );
      }
    } else if (intent.operation === "update" && !Object.keys(values).length) {
      throw new Error("Tidak ada field yang akan diubah");
    }

    const recordLabel = record
      ? describe(record, config)
      : String(values.kode ?? config.label);
    const impact = intent.operation === "delete" && record
      ? await deletionImpact(supabase, config, String(record.id))
      : "";
    const actionLabel = intent.operation === "insert"
      ? "Tambah"
      : intent.operation === "update"
      ? "Ubah"
      : "Hapus";
    const detail = intent.operation === "delete"
      ? impact
      : `\nData: ${stringifyIntentValues(values)}`;
    const { data: pending, error } = await supabase.from(
      "telegram_pending_actions",
    ).insert({
      action: intent.operation,
      table_name: config.table,
      record_id: record?.id ?? null,
      record_label: recordLabel,
      payload: values,
      requested_by: userId,
      chat_id: chatId,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    }).select("id").single();
    if (error) throw error;
    return {
      text:
        `Konfirmasi ${actionLabel.toLowerCase()} ${config.label} ${recordLabel}?${detail}`,
      replyMarkup: {
        inline_keyboard: [[
          {
            text: `✅ Konfirmasi ${actionLabel}`,
            callback_data: `crud:confirm:${pending.id}`,
          },
          { text: "Batal", callback_data: `crud:cancel:${pending.id}` },
        ]],
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { text: `❌ ${message}` };
  }
}

export async function processCrudCallback(
  supabase: SupabaseClient,
  callbackData: string,
  userId: number,
  chatId: number,
): Promise<string> {
  const match = callbackData.match(/^crud:(confirm|cancel):([0-9a-f-]+)$/i);
  if (!match) return "Aksi tidak dikenal.";
  const decision = match[1].toLowerCase();
  const actionId = match[2];
  const { data: action, error } = await supabase.from(
    "telegram_pending_actions",
  )
    .select("*").eq("id", actionId).maybeSingle();
  if (error) throw error;
  if (
    !action || Number(action.requested_by) !== userId ||
    Number(action.chat_id) !== chatId
  ) {
    return "Permintaan tidak ditemukan.";
  }
  if (action.status !== "pending") return `Permintaan sudah ${action.status}.`;
  if (new Date(action.expires_at).getTime() < Date.now()) {
    await supabase.from("telegram_pending_actions").update({
      status: "expired",
    }).eq("id", actionId);
    return "Permintaan hapus sudah kedaluwarsa.";
  }
  if (decision === "cancel") {
    await supabase.from("telegram_pending_actions").update({
      status: "cancelled",
    }).eq("id", actionId);
    return `Dibatalkan. ${action.record_label} tidak dihapus.`;
  }

  const allowedTables = new Set(["ayam_induk", "breeding", "ayam_anakan"]);
  if (!allowedTables.has(action.table_name)) {
    throw new Error("Target tabel tidak diizinkan");
  }
  if (action.action === "insert") {
    const { error: insertError } = await supabase.from(action.table_name)
      .insert(action.payload ?? {});
    if (insertError) throw insertError;
  } else if (action.action === "update") {
    const { error: updateError } = await supabase.from(action.table_name)
      .update(action.payload ?? {}).eq("id", action.record_id);
    if (updateError) throw updateError;
  } else {
    const { error: deleteError } = await supabase.from(action.table_name)
      .delete()
      .eq("id", action.record_id);
    if (deleteError) throw deleteError;
  }
  await supabase.from("telegram_pending_actions").update({
    status: "confirmed",
    executed_at: new Date().toISOString(),
  }).eq("id", actionId);
  const verb = action.action === "insert"
    ? "ditambahkan"
    : action.action === "update"
    ? "diperbarui"
    : "dihapus";
  return `✅ ${action.record_label} berhasil ${verb}.`;
}
