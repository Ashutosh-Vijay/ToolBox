import { Fragment, useMemo, useState, type ReactNode } from "react";
import { Icon } from "../Icon";
import { Btn } from "../ui/Btn";
import { CopyButton } from "../ui/CopyButton";
import { ErrorBanner } from "../ui/ErrorBanner";
import { decodeJwt, CLAIM_NOTES, epochToHuman, type DecodedJwt } from "../../lib/crypto";

type DecodeState =
  | { empty: true }
  | { error: string }
  | (DecodedJwt & { ok: true });

function ClaimRows({
  obj,
  decorate,
}: {
  obj: Record<string, unknown>;
  decorate?: (k: string, v: unknown) => ReactNode;
}) {
  return (
    <div className="kv">
      {Object.entries(obj).map(([k, v]) => {
        let cls = "v";
        let display: string;
        if (typeof v === "string") {
          cls += " str";
          display = `"${v}"`;
        } else if (typeof v === "number") {
          cls += " num";
          display = String(v);
        } else if (typeof v === "boolean") {
          cls += " bool";
          display = String(v);
        } else {
          display = JSON.stringify(v);
        }
        const note = decorate ? decorate(k, v) : null;
        return (
          <Fragment key={k}>
            <span className="k">{k}</span>
            <span>
              <span className={cls}>{display}</span>
              {note && <div className="claim-note">{note}</div>}
            </span>
          </Fragment>
        );
      })}
    </div>
  );
}

export function JwtTool() {
  const [token, setToken] = useState("");

  const decoded = useMemo<DecodeState>(() => {
    if (!token.trim()) return { empty: true };
    try {
      return { ...decodeJwt(token), ok: true };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [token]);

  const parts = token.trim().split(".");

  const decorateHeader = (k: string) => CLAIM_NOTES[k] || null;
  const decoratePayload = (k: string, v: unknown): ReactNode => {
    if (["exp", "iat", "nbf"].includes(k) && typeof v === "number") {
      const human = epochToHuman(v);
      const isExp = k === "exp";
      const expired = isExp && v * 1000 < Date.now();
      return (
        <>
          {CLAIM_NOTES[k]} · {human}
          {expired ? " · ⚠ expired" : isExp ? " · valid" : ""}
        </>
      );
    }
    return CLAIM_NOTES[k] || null;
  };

  const ok = "ok" in decoded;
  const exp = ok ? (decoded.payload.exp as number | undefined) : undefined;
  const expired = !!exp && exp * 1000 < Date.now();

  return (
    <div className="tool-fade">
      <div className="ws-toolbar">
        <span className="pill">
          <Icon name="shield" style={{ width: 13, height: 13 }} />
          Decoded locally · signature never sent anywhere
        </span>
        <span className="spacer" />
        <Btn icon="trash" variant="danger" onClick={() => setToken("")} disabled={!token}>
          Clear
        </Btn>
      </div>

      <div className="jwt-grid">
        {/* left: token w/ colored segments + signature */}
        <div className="jwt-stack">
          <div className="jwt-token">
            <div className="pane-head">
              <span className="pane-title">
                <span className="dot" />
                Encoded token
              </span>
              <span className="acts">
                <CopyButton text={token} />
              </span>
            </div>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste a JWT (eyJ…)"
              spellCheck={false}
            />
            {ok && (
              <div className="jwt-token-body" style={{ borderTop: "1px solid var(--border)" }}>
                <span className="jwt-seg h">{parts[0]}</span>
                <span className="jwt-dot">.</span>
                <span className="jwt-seg p">{parts[1]}</span>
                <span className="jwt-dot">.</span>
                <span className="jwt-seg s">{parts[2] || ""}</span>
              </div>
            )}
          </div>

          {ok && (
            <div className="jwt-card jwt-s">
              <div className="jwt-card-head">
                <span className="swatch" />
                <span className="ttl">
                  Signature<span className="seg-label">{(decoded.header.alg as string) || "—"}</span>
                </span>
                <span className="acts">
                  <CopyButton text={decoded.signature} />
                </span>
              </div>
              <div className="jwt-card-body">
                <div className="rr-val" style={{ color: "var(--code-num)", marginBottom: 12 }}>
                  {decoded.signature || "— no signature segment —"}
                </div>
                <div className="sig-state warn">
                  <Icon name="info" />
                  Signature verification needs the secret / public key. ToolBox decodes only.
                </div>
                <div className={"sig-state " + (expired ? "warn" : "ok")} style={{ marginTop: 8 }}>
                  <Icon name={expired ? "alert" : "check"} />
                  {exp
                    ? expired
                      ? "Token has expired"
                      : "Token is within its validity window"
                    : "No expiry claim present"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* right: decoded header + payload */}
        <div className="jwt-stack">
          {"empty" in decoded && (
            <div className="jwt-card">
              <div className="jwt-card-body" style={{ color: "var(--text-3)", textAlign: "center", padding: 40 }}>
                Paste a token to see its decoded contents.
              </div>
            </div>
          )}
          {"error" in decoded && <ErrorBanner title="Could not decode token">{decoded.error}</ErrorBanner>}
          {ok && (
            <>
              <div className="jwt-card jwt-h">
                <div className="jwt-card-head">
                  <span className="swatch" />
                  <span className="ttl">
                    Header<span className="seg-label">algorithm &amp; token type</span>
                  </span>
                  <span className="acts">
                    <CopyButton text={JSON.stringify(decoded.header, null, 2)} />
                  </span>
                </div>
                <div className="jwt-card-body">
                  <ClaimRows obj={decoded.header} decorate={decorateHeader} />
                </div>
              </div>
              <div className="jwt-card jwt-p">
                <div className="jwt-card-head">
                  <span className="swatch" />
                  <span className="ttl">
                    Payload<span className="seg-label">{Object.keys(decoded.payload).length} claims</span>
                  </span>
                  <span className="acts">
                    <CopyButton text={JSON.stringify(decoded.payload, null, 2)} />
                  </span>
                </div>
                <div className="jwt-card-body">
                  <ClaimRows obj={decoded.payload} decorate={decoratePayload} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
