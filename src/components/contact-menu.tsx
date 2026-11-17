import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Mail, MessageCircle } from "lucide-react";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { EMAIL, WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/contact";

const items = [
  {
    icon: Mail,
    label: "Email",
    value: EMAIL,
    href: `mailto:${EMAIL}`,
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: WHATSAPP_DISPLAY,
    href: WHATSAPP_URL,
  },
];

export function ContactMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <LiquidMetalButton label="Contact" onClick={() => setOpen((o) => !o)} />

      {open && (
        <div className="pop-in absolute top-[58px] right-0 z-40 w-[290px] rounded-2xl bg-white/90 p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_24px_48px_-12px_rgba(0,0,0,0.22)] ring-1 ring-black/5 backdrop-blur-xl">
          {items.map(({ icon: Icon, label, value, href }) => (
            <a
              key={label}
              href={href}
              target={label === "Email" ? undefined : "_blank"}
              rel="noreferrer"
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-black/[0.04]"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                <Icon size={17} strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] leading-4 text-neutral-500">
                  {label}
                </span>
                <span className="block truncate text-[13.5px] leading-5 font-medium text-neutral-900">
                  {value}
                </span>
              </span>
              <ArrowUpRight
                size={15}
                className="shrink-0 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-neutral-700"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
