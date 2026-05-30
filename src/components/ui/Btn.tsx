import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "../Icon";

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: string;
  children?: ReactNode;
  variant?: "" | "primary" | "ghost" | "danger";
  size?: "" | "sm";
  iconOnly?: boolean;
};

export function Btn({ icon, children, variant = "", size = "", iconOnly, ...rest }: BtnProps) {
  return (
    <button className={`btn ${variant} ${size} ${iconOnly ? "icon" : ""}`.replace(/\s+/g, " ").trim()} {...rest}>
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}
