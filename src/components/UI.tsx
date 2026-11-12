import { useEffect, useRef, useId, type ReactNode } from "react";
import {
  X,
  ArrowUpRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  Minus,
  LoaderCircle,
} from "lucide-react";
import type { State } from "../types";
import { STATE_LABEL } from "../data/catalog";
export function Badge({
  state,
  label,
}: {
  state: State | string;
  label?: string;
}) {
  const Icon =
    state === "within"
      ? CheckCircle2
      : state === "watch" || state === "review"
        ? AlertTriangle
        : state === "learning"
          ? LoaderCircle
          : Minus;
  return (
    <span className={`badge ${state}`}>
      <Icon size={12} />
      {label || STATE_LABEL[state as State] || state}
    </span>
  );
}
export function Panel({
  children,
  className = "",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section className={`panel ${className}`} {...rest}>
      {children}
    </section>
  );
}
export function SectionHead({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}
export function External({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      className="external"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ArrowUpRight size={14} />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
export function Notice({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "warning" | "success";
}) {
  return (
    <div className={`notice ${tone}`}>
      <Info size={17} />
      <div>{children}</div>
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    id = useId();
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    ref.current?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
      if (previousFocus?.isConnected)
        previousFocus.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={wide ? "modal wide" : "modal"}
      aria-labelledby={id}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-head">
        <div>
          <span className="eyebrow">PROHOR / LOCAL WORKSPACE</span>
          <h2 id={id}>{title}</h2>
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Empty({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-symbol">＋</div>
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
