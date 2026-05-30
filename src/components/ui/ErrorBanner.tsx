import type { ReactNode } from "react";
import { Icon } from "../Icon";

export function ErrorBanner({ title = "Invalid input", children }: { title?: string; children: ReactNode }) {
  return (
    <div className="err-banner">
      <span className="eb-ico">
        <Icon name="alert" />
      </span>
      <div>
        <div className="eb-ttl">{title}</div>
        <div className="eb-msg">{children}</div>
      </div>
    </div>
  );
}
