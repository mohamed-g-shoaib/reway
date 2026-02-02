"use client";

import { useEffect, useRef } from "react";

type KeydownHandler = (event: KeyboardEvent) => void;

const captureHandlers = new Set<KeydownHandler>();
const bubbleHandlers = new Set<KeydownHandler>();
let isCaptureListenerAttached = false;
let isBubbleListenerAttached = false;

function ensureListener(capture: boolean) {
  if (capture) {
    if (isCaptureListenerAttached) return;
    window.addEventListener(
      "keydown",
      (event) => {
        captureHandlers.forEach((handler) => handler(event));
      },
      { capture: true },
    );
    isCaptureListenerAttached = true;
    return;
  }

  if (isBubbleListenerAttached) return;
  window.addEventListener("keydown", (event) => {
    bubbleHandlers.forEach((handler) => handler(event));
  });
  isBubbleListenerAttached = true;
}

function registerHandler(handler: KeydownHandler, capture: boolean) {
  const target = capture ? captureHandlers : bubbleHandlers;
  target.add(handler);
  if (typeof window !== "undefined") {
    ensureListener(capture);
  }
  return () => {
    target.delete(handler);
  };
}

export function useGlobalKeydown(
  handler: KeydownHandler,
  options?: { capture?: boolean },
) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const wrapped: KeydownHandler = (event) => handlerRef.current(event);
    return registerHandler(wrapped, options?.capture ?? false);
  }, [options?.capture]);
}
