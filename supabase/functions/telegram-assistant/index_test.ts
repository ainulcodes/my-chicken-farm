import { assertEquals } from "jsr:@std/assert@1";
import {
  addDays,
  dateInJakarta,
  secureEqual,
  splitTelegramText,
} from "./index.ts";

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
