import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export type AuditContext = {
  userId: number;
  chatId: number;
  pendingActionId?: string;
  groupId?: string;
};

type Row = Record<string, unknown>;

function labelOf(row: Row): string {
  return String(row.kode ?? row.nama ?? row.id ?? "record");
}

function mutableData(row: Row): Row {
  const output = { ...row };
  delete output.id;
  delete output.created_at;
  return output;
}

async function insertAuditRows(
  supabase: SupabaseClient,
  groupId: string,
  action: "insert" | "update" | "delete",
  table: string,
  beforeRows: Row[],
  afterRows: Row[],
  context: AuditContext,
): Promise<void> {
  const beforeById = new Map(beforeRows.map((row) => [String(row.id), row]));
  const afterById = new Map(afterRows.map((row) => [String(row.id), row]));
  const ids = [...new Set([...beforeById.keys(), ...afterById.keys()])];
  if (!ids.length) return;
  const auditRows = ids.map((id) => {
    const before = beforeById.get(id) ?? null;
    const after = afterById.get(id) ?? null;
    return {
      group_id: groupId,
      action,
      table_name: table,
      record_id: id,
      record_label: labelOf(after ?? before ?? { id }),
      before_data: before,
      after_data: after,
      requested_by: context.userId,
      chat_id: context.chatId,
      pending_action_id: context.pendingActionId ?? null,
    };
  });
  const { error } = await supabase.from("telegram_audit_log").insert(auditRows);
  if (error) {
    throw new Error(`Data berubah tetapi audit log gagal: ${error.message}`);
  }
}

export async function auditedInsert(
  supabase: SupabaseClient,
  table: string,
  values: Row | Row[],
  context: AuditContext,
): Promise<Row[]> {
  const { data, error } = await supabase.from(table).insert(values).select();
  if (error) throw error;
  const rows = (data ?? []) as Row[];
  await insertAuditRows(
    supabase,
    context.groupId ?? crypto.randomUUID(),
    "insert",
    table,
    [],
    rows,
    context,
  );
  return rows;
}

export async function auditedUpdate(
  supabase: SupabaseClient,
  table: string,
  recordIds: string[],
  values: Row,
  context: AuditContext,
): Promise<Row[]> {
  const { data: before, error: beforeError } = await supabase.from(table)
    .select("*").in("id", recordIds);
  if (beforeError) throw beforeError;
  const { data: after, error } = await supabase.from(table).update(values)
    .in("id", recordIds).select();
  if (error) throw error;
  await insertAuditRows(
    supabase,
    context.groupId ?? crypto.randomUUID(),
    "update",
    table,
    (before ?? []) as Row[],
    (after ?? []) as Row[],
    context,
  );
  return (after ?? []) as Row[];
}

export async function auditedDelete(
  supabase: SupabaseClient,
  table: string,
  recordIds: string[],
  context: AuditContext,
): Promise<void> {
  const groupId = context.groupId ?? crypto.randomUUID();
  const { data: targets, error: targetError } = await supabase.from(table)
    .select("*").in("id", recordIds);
  if (targetError) throw targetError;

  let cascadeChildren: Row[] = [];
  let affectedBreedings: Row[] = [];
  if (table === "breeding") {
    const { data, error } = await supabase.from("ayam_anakan").select("*")
      .in("breeding_id", recordIds);
    if (error) throw error;
    cascadeChildren = (data ?? []) as Row[];
  } else if (table === "ayam_induk") {
    const filters = recordIds.flatMap((id) => [
      `pejantan_id.eq.${id}`,
      `betina_id.eq.${id}`,
    ]).join(",");
    const { data, error } = await supabase.from("breeding").select("*").or(
      filters,
    );
    if (error) throw error;
    affectedBreedings = (data ?? []) as Row[];
  }

  const { error } = await supabase.from(table).delete().in("id", recordIds);
  if (error) throw error;
  await insertAuditRows(
    supabase,
    groupId,
    "delete",
    table,
    (targets ?? []) as Row[],
    [],
    context,
  );
  await insertAuditRows(
    supabase,
    groupId,
    "delete",
    "ayam_anakan",
    cascadeChildren,
    [],
    context,
  );
  if (affectedBreedings.length) {
    const ids = affectedBreedings.map((row) => String(row.id));
    const { data: after, error: afterError } = await supabase.from("breeding")
      .select("*").in("id", ids);
    if (afterError) throw afterError;
    await insertAuditRows(
      supabase,
      groupId,
      "update",
      "breeding",
      affectedBreedings,
      (after ?? []) as Row[],
      context,
    );
  }
}

export async function latestUndoGroup(
  supabase: SupabaseClient,
  userId: number,
): Promise<{ groupId: string; summary: string; count: number } | null> {
  const { data: latest, error } = await supabase.from("telegram_audit_log")
    .select("group_id").eq("requested_by", userId).is("undone_at", null)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  if (!latest) return null;
  const { data: rows, error: rowsError } = await supabase.from(
    "telegram_audit_log",
  )
    .select("action,table_name,record_label").eq("group_id", latest.group_id)
    .order("created_at", { ascending: true });
  if (rowsError) throw rowsError;
  const values = rows ?? [];
  const preview = values.slice(0, 8).map((row) =>
    `${row.action} ${row.table_name}: ${row.record_label}`
  ).join("\n");
  return {
    groupId: latest.group_id,
    count: values.length,
    summary: `${preview}${
      values.length > 8 ? `\n…dan ${values.length - 8} perubahan terkait` : ""
    }`,
  };
}

export async function auditHistory(
  supabase: SupabaseClient,
  userId: number,
  limit = 10,
): Promise<string> {
  const { data, error } = await supabase.from("telegram_audit_log")
    .select("group_id,action,table_name,record_label,created_at,undone_at")
    .eq("requested_by", userId).order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  const groups = new Map<string, Array<Record<string, unknown>>>();
  for (const row of data ?? []) {
    const key = String(row.group_id);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)?.push(row);
  }
  if (!groups.size) return "Belum ada riwayat perubahan dari Telegram.";
  const lines = [...groups.values()].slice(0, limit).map((rows, index) => {
    const first = rows[0];
    const time = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(String(first.created_at)));
    const status = first.undone_at ? " (dibatalkan)" : "";
    return `${
      index + 1
    }. ${time} — ${first.action} ${rows.length} record${status}\n   ${first.record_label}`;
  });
  return `Riwayat perubahan terakhir:\n\n${lines.join("\n")}`;
}

export async function undoAuditGroup(
  supabase: SupabaseClient,
  groupId: string,
  userId: number,
): Promise<number> {
  const { data, error } = await supabase.from("telegram_audit_log").select("*")
    .eq("group_id", groupId).eq("requested_by", userId).is("undone_at", null);
  if (error) throw error;
  const rows = (data ?? []) as Row[];
  if (!rows.length) {
    throw new Error("Audit tidak ditemukan atau sudah dibatalkan");
  }

  const tableOrder: Record<string, number> = {
    ayam_induk: 1,
    breeding: 2,
    ayam_anakan: 3,
  };
  const deleted = rows.filter((row) => row.action === "delete")
    .sort((a, b) =>
      tableOrder[String(a.table_name)] - tableOrder[String(b.table_name)]
    );
  for (const row of deleted) {
    const { error: restoreError } = await supabase.from(String(row.table_name))
      .upsert(row.before_data as Row, { onConflict: "id" });
    if (restoreError) throw restoreError;
  }
  for (const row of rows.filter((item) => item.action === "update")) {
    const { error: updateError } = await supabase.from(String(row.table_name))
      .update(mutableData(row.before_data as Row)).eq("id", row.record_id);
    if (updateError) throw updateError;
  }
  const inserted = rows.filter((row) => row.action === "insert")
    .sort((a, b) =>
      tableOrder[String(b.table_name)] - tableOrder[String(a.table_name)]
    );
  for (const row of inserted) {
    const { error: deleteError } = await supabase.from(String(row.table_name))
      .delete().eq("id", row.record_id);
    if (deleteError) throw deleteError;
  }
  const { error: markError } = await supabase.from("telegram_audit_log").update(
    {
      undone_at: new Date().toISOString(),
      undone_by: userId,
    },
  ).eq("group_id", groupId);
  if (markError) throw markError;
  return rows.length;
}
