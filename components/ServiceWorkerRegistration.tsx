"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const swVersion = "3";
    navigator.serviceWorker.register(`/sw.js?v=${swVersion}`).catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  }, []);

  return null;
}
