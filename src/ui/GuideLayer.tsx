"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useWorld } from "@/world/store";

const KEY = "kalpana-guided-v1";

type Mark = { id: string; x: number; y: number; label: string; center?: boolean };

/**
 * A one-time, minimalist welcome layer. On a visitor's first arrival in the
 * world it points — quietly — at the three things worth knowing: drag to look,
 * the day/night switch, and the classic reading view. It fades on the first
 * scroll, drag, or tap, and never shows again.
 */
export function GuideLayer() {
  const phase = useWorld((s) => s.phase);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (phase !== "world") return;
    try {
      if (localStorage.getItem(KEY)) return;
    } catch {
      return;
    }
    // let the HUD paint, then measure the real controls
    const t0 = window.setTimeout(() => {
      const next: Mark[] = [
        { id: "drag", x: window.innerWidth / 2, y: window.innerHeight / 2, label: "drag to look around", center: true },
      ];
      const anchor = (sel: string, label: string) => {
        const el = document.querySelector(sel) as HTMLElement | null;
        if (!el) return;
        const r = el.getBoundingClientRect();
        next.push({ id: sel, x: r.left + r.width / 2, y: r.bottom + 12, label });
      };
      anchor('[data-guide="night"]', "day / night");
      anchor('[data-guide="classic"]', "read it instead");
      setMarks(next);
      setShow(true);
      try {
        localStorage.setItem(KEY, "1");
      } catch {
        /* ignore */
      }
    }, 900);

    const dismiss = () => setShow(false);
    window.addEventListener("pointerdown", dismiss, { once: true });
    window.addEventListener("wheel", dismiss, { once: true, passive: true });
    window.addEventListener("keydown", dismiss, { once: true });
    const t1 = window.setTimeout(dismiss, 7000);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("wheel", dismiss);
      window.removeEventListener("keydown", dismiss);
    };
  }, [phase]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="guide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          aria-hidden
        >
          {marks.map((m, i) => (
            <motion.div
              key={m.id}
              className={`guide-mark ${m.center ? "is-center" : ""}`}
              style={{ left: m.x, top: m.y }}
              initial={{ opacity: 0, y: m.center ? 0 : -6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {m.center ? (
                <span className="guide-ring" />
              ) : (
                <span className="guide-dot" />
              )}
              <span className="guide-label">{m.label}</span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
