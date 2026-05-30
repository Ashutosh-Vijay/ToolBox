import { ConvertTool } from "./ConvertTool";
import {
  urlEncode,
  urlDecode,
  textToHex,
  hexToText,
  htmlEscape,
  htmlUnescape,
  unicodeEscape,
  unicodeUnescape,
  base58Encode,
  base58Decode,
} from "../../lib/crypto";

export const UrlTool = () => (
  <ConvertTool
    encodeTitle="Plain text"
    decodeTitle="Encoded URL"
    encode={urlEncode}
    decode={urlDecode}
    encodePlaceholder="https://example.com/path?q=hello world&x=å"
    decodePlaceholder="https%3A%2F%2Fexample.com%2F…"
  />
);

export const HexTool = () => (
  <ConvertTool
    encodeTitle="Plain text"
    decodeTitle="Hex"
    encode={textToHex}
    decode={hexToText}
    encodePlaceholder="Type text to convert to hex…"
    decodePlaceholder="48 65 6c 6c 6f  (or 48656c6c6f)"
  />
);

export const HtmlTool = () => (
  <ConvertTool
    encodeTitle="Plain text"
    decodeTitle="HTML-escaped"
    encode={htmlEscape}
    decode={htmlUnescape}
    encodePlaceholder='<a href="x">Tom & Jerry</a>'
    decodePlaceholder="&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&lt;/a&gt;"
  />
);

export const UnicodeTool = () => (
  <ConvertTool
    encodeTitle="Plain text"
    decodeTitle="\\u escaped"
    encode={unicodeEscape}
    decode={unicodeUnescape}
    encodePlaceholder="Héllo 世界 👋"
    decodePlaceholder="H\\u00e9llo \\u4e16\\u754c"
  />
);

export const Base58Tool = () => (
  <ConvertTool
    encodeTitle="Plain text"
    decodeTitle="Base58"
    encode={base58Encode}
    decode={base58Decode}
    encodePlaceholder="Type text to Base58-encode…"
    decodePlaceholder="Paste Base58 (Bitcoin alphabet)…"
  />
);
