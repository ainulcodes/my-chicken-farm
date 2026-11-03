import { assertEquals } from "jsr:@std/assert@1";
import {
  addDays,
  contextualMessageText,
  dateInJakarta,
  formatTextTable,
  markdownToTelegramHtml,
  secureEqual,
  splitTelegramText,
} from "./index.ts";
import { parseKeyValues } from "./crud.ts";

Deno.test("secureEqual membandingkan nilai dan panjang", () => {
  assertEquals(secureEqual("secret_123", "secret_123"), true);
  assertEquals(secureEqual("secret_123", "secret_124"), false);
  assertEquals(secureEqual("short", "longer"), false);
});

Deno.test("addDays mempertahankan tanggal tanpa pergeseran zona waktu", () => {
  assertEquals(addDays("2026-11-03", 7), "2026-11-10");
  assertEquals(addDays("2026-12-30", 3), "2027-01-02");
});

Deno.test("dateInJakarta memakai zona waktu Asia/Jakarta", () => {
  assertEquals(dateInJakarta(new Date("2026-11-02T18:00:00Z")), "2026-11-03");
});

Deno.test("splitTelegramText menjaga setiap bagian di bawah limit", () => {
  const result = splitTelegramText("baris satu\nbaris dua\nbaris tiga", 15);
  assertEquals(result, ["baris satu", "baris dua", "baris tiga"]);
});

Deno.test("markdownToTelegramHtml mengubah format dan mengamankan HTML", () => {
  assertEquals(
    markdownToTelegramHtml("**Ringkasan**\n* Sehat: 3\n<rahasia>"),
    "<b>Ringkasan</b>\n• Sehat: 3\n&lt;rahasia&gt;",
  );
});

Deno.test("parseKeyValues mendukung alias dan nilai dengan spasi", () => {
  assertEquals(
    parseKeyValues('kode=PJ-01 nama="Jago Merah" jk=Jantan lahir=2026-01-02'),
    {
      kode: "PJ-01",
      nama: "Jago Merah",
      jenis_kelamin: "Jantan",
      tanggal_lahir: "2026-01-02",
    },
  );
});

Deno.test("contextualMessageText menyertakan pesan yang dibalas", () => {
  const result = contextualMessageText({
    message_id: 2,
    chat: { id: 1, type: "private" },
    text: "beserta umurnya",
    reply_to_message: { message_id: 1, text: "Data anakan AN-01" },
  });
  assertEquals(result.includes("Data anakan AN-01"), true);
  assertEquals(result.endsWith("beserta umurnya"), true);
});

Deno.test("formatTextTable meratakan dan memotong kolom", () => {
  assertEquals(
    formatTextTable(["Kode", "Status"], [["AN-01", "Sehat"], [
      "AN-02",
      "Sangat Panjang",
    ]], [5, 6]),
    "Kode  | Status\n------+-------\nAN-01 | Sehat\nAN-02 | Sanga…",
  );
});
