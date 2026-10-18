"use client";

import { useEffect, useState } from "react";

// Only the small clock needs second-by-second updates; the rest of the page
// refreshes once a minute. Suspend both while the tab is hidden.
export default function useClock(interval = 1000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      clearTimeout(timer);
      if (document.hidden) return;
      setNow(new Date());
      timer = setTimeout(tick, interval - (Date.now() % interval));
    };
    tick();
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [interval]);

  return now;
}
