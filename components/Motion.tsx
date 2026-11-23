"use client";

// Reveals anything marked `reveal` as it scrolls into view. Without JavaScript,
// or with "reduce motion" turned on, everything simply shows.

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add("motion-ready");
    const items = document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)");
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const watcher = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            watcher.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    items.forEach((el) => watcher.observe(el));
    return () => watcher.disconnect();
  }, [pathname]);

  return null;
}
