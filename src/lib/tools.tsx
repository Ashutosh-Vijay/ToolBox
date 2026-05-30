/* ============================================================
   tools.tsx — the tool registry. This is the extensibility core:
   every tool is one config object here. To add a tool, drop a
   component into components/tools and add one entry below — set
   status: "live" and point `component` at it. Nothing else changes.
   ============================================================ */
import type { ComponentType } from "react";
import { Base64Tool } from "../components/tools/Base64Tool";
import { HashTool } from "../components/tools/HashTool";
import { JwtTool } from "../components/tools/JwtTool";
import { UrlTool, HexTool, HtmlTool, UnicodeTool, Base58Tool } from "../components/tools/encodingTools";
import { HmacTool, Crc32Tool, BcryptTool } from "../components/tools/hashingTools";
import { AesTool, RsaTool, PgpTool } from "../components/tools/cryptoTools";
import { JsonTool, XmlTool, SqlTool, YamlTool, DiffTool } from "../components/tools/formatterTools";
import { UuidTool, PasswordTool, LoremTool, QrTool, RegexTool } from "../components/tools/generatorTools";
import { TimeTool } from "../components/tools/timeTools";

export type ToolStatus = "live" | "soon";

export type Category = {
  id: string;
  name: string;
  color: string;
};

export type Tool = {
  id: string;
  name: string;
  icon: string;
  cat: string;
  status: ToolStatus;
  kw: string;
  desc: string;
  component?: ComponentType;
};

export const CATEGORIES: Category[] = [
  { id: "encoding", name: "Encoding", color: "#2fe6d2" },
  { id: "hashing", name: "Hashing", color: "#a78bfa" },
  { id: "crypto", name: "Crypto", color: "#ffc24b" },
  { id: "formatters", name: "Formatters", color: "#46e08a" },
  { id: "generators", name: "Generators", color: "#7fd8ff" },
  { id: "datetime", name: "Date & Time", color: "#ff9e64" },
];

export const TOOLS: Tool[] = [
  // ENCODING
  { id: "base64", name: "Base64", icon: "binary", cat: "encoding", status: "live", component: Base64Tool,
    kw: "base64 encode decode binary file atob btoa", desc: "Encode & decode Base64 — text or files, both directions." },
  { id: "url", name: "URL Encode / Decode", icon: "link", cat: "encoding", status: "live", component: UrlTool,
    kw: "url uri percent encode decode escape querystring", desc: "Percent-encode and decode URL components." },
  { id: "hex", name: "Hex ↔ Text", icon: "type", cat: "encoding", status: "live", component: HexTool,
    kw: "hex hexadecimal text bytes ascii", desc: "Convert between hexadecimal and plain text." },
  { id: "html", name: "HTML Entities", icon: "code", cat: "encoding", status: "live", component: HtmlTool,
    kw: "html entities escape unescape amp lt gt", desc: "Escape and unescape HTML entities." },
  { id: "unicode", name: "Unicode Escape", icon: "globe", cat: "encoding", status: "live", component: UnicodeTool,
    kw: "unicode escape utf16 codepoint", desc: "Escape strings to \\u sequences and back." },
  { id: "base58", name: "Base58", icon: "layers", cat: "encoding", status: "live", component: Base58Tool,
    kw: "base58 bitcoin btc encode", desc: "Base58 encode / decode (Bitcoin alphabet)." },

  // HASHING
  { id: "hash", name: "Hash Generator", icon: "hash", cat: "hashing", status: "live", component: HashTool,
    kw: "hash md5 sha sha1 sha256 sha512 checksum digest", desc: "MD5, SHA-1, SHA-256, SHA-384, SHA-512 in one pass." },
  { id: "hmac", name: "HMAC", icon: "fingerprint", cat: "hashing", status: "live", component: HmacTool,
    kw: "hmac hash key signature mac", desc: "Keyed-hash message authentication code." },
  { id: "bcrypt", name: "bcrypt", icon: "lock", cat: "hashing", status: "live", component: BcryptTool,
    kw: "bcrypt password hash salt rounds", desc: "Hash & verify passwords with bcrypt." },
  { id: "crc32", name: "CRC32", icon: "shield", cat: "hashing", status: "live", component: Crc32Tool,
    kw: "crc crc32 checksum", desc: "Cyclic redundancy checksum." },

  // CRYPTO
  { id: "aes", name: "AES Encrypt / Decrypt", icon: "lock", cat: "crypto", status: "live", component: AesTool,
    kw: "aes encrypt decrypt cipher key iv cbc gcm symmetric", desc: "Symmetric AES with key, IV and selectable mode." },
  { id: "jwt", name: "JWT Decoder", icon: "token", cat: "crypto", status: "live", component: JwtTool,
    kw: "jwt json web token decode header payload signature claims auth bearer", desc: "Decode and inspect JSON Web Tokens." },
  { id: "rsa", name: "RSA Keypair", icon: "key", cat: "crypto", status: "live", component: RsaTool,
    kw: "rsa keypair public private key generate", desc: "Generate RSA public / private key pairs." },
  { id: "pgp", name: "PGP", icon: "shield", cat: "crypto", status: "live", component: PgpTool,
    kw: "pgp gpg encrypt sign openpgp", desc: "Encrypt, decrypt & sign with OpenPGP." },

  // FORMATTERS
  { id: "json", name: "JSON Formatter", icon: "braces", cat: "formatters", status: "live", component: JsonTool,
    kw: "json format beautify minify prettify validate lint java mule map tostring logger", desc: "Beautify, minify & validate JSON — and convert Java/Mule map toString() to JSON." },
  { id: "xml", name: "XML Formatter", icon: "code", cat: "formatters", status: "live", component: XmlTool,
    kw: "xml format beautify pretty", desc: "Pretty-print and minify XML documents." },
  { id: "sql", name: "SQL Formatter", icon: "database", cat: "formatters", status: "live", component: SqlTool,
    kw: "sql format query beautify", desc: "Format SQL queries to a readable style." },
  { id: "yaml", name: "YAML ↔ JSON", icon: "diff", cat: "formatters", status: "live", component: YamlTool,
    kw: "yaml json convert", desc: "Convert between YAML and JSON." },
  { id: "diff", name: "Text Diff", icon: "diff", cat: "formatters", status: "live", component: DiffTool,
    kw: "diff compare text changes", desc: "Compare two texts line by line." },

  // GENERATORS
  { id: "uuid", name: "UUID / Bytes", icon: "dice", cat: "generators", status: "live", component: UuidTool,
    kw: "uuid guid random bytes nanoid generate id", desc: "Random UUIDs, secure random bytes & tokens." },
  { id: "password", name: "Password", icon: "password", cat: "generators", status: "live", component: PasswordTool,
    kw: "password generate random strong", desc: "Generate strong random passwords." },
  { id: "lorem", name: "Lorem Ipsum", icon: "text", cat: "generators", status: "live", component: LoremTool,
    kw: "lorem ipsum placeholder text dummy", desc: "Placeholder paragraphs, sentences & words." },
  { id: "qr", name: "QR Code", icon: "qr", cat: "generators", status: "live", component: QrTool,
    kw: "qr code generate barcode", desc: "Turn text or URLs into QR codes." },
  { id: "regex", name: "Regex Tester", icon: "regex", cat: "generators", status: "live", component: RegexTool,
    kw: "regex regular expression test match", desc: "Test regular expressions live." },

  // DATE & TIME
  { id: "time", name: "World Clock", icon: "clock", cat: "datetime", status: "live", component: TimeTool,
    kw: "time clock now current ist gmt utc epoch unix timestamp timezone date convert", desc: "Current time in IST, UTC/GMT, epoch & more — and convert any timestamp." },
];

export const LIVE_COUNT = TOOLS.filter((t) => t.status === "live").length;

export const toolById = (id: string | null) => TOOLS.find((t) => t.id === id);
export const catById = (id: string) => CATEGORIES.find((c) => c.id === id)!;
