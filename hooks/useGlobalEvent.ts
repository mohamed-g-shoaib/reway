"use client";

import { useEffect, useRef } from "react";

type WindowEventName = keyof WindowEventMap;

type EventHandler<K extends WindowEventName> = (
  event: WindowEventMap[K],
) => void;

type ListenerOptions = AddEventListenerOptions & { capture?: boolean };

const handlerRegistry = new Map<string, Set<EventListener>>();
const listenerAttached = new Set<string>();

function getKey(type: string, options?: ListenerOptions) {
  const capture = options?.capture ? "1" : "0";
  const passive = options?.passive ? "1" : "0";
  return `${type}|c:${capture}|p:${passive}`;
}

function ensureListener(type: string, options?: ListenerOptions) {
  const key = getKey(type, options);
  if (listenerAttached.has(key)) return;

  const handler = (event: Event) => {
    const handlers = handlerRegistry.get(key);
    if (!handlers || handlers.size === 0) return;
    handlers.forEach((cb) => cb(event));
  };

  window.addEventListener(type, handler, options);
  listenerAttached.add(key);
}

function registerHandler(
  type: string,
  listener: EventListener,
  options?: ListenerOptions,
) {
  const key = getKey(type, options);
  const handlers = handlerRegistry.get(key) ?? new Set<EventListener>();
  handlers.add(listener);
  handlerRegistry.set(key, handlers);
  if (typeof window !== "undefined") {
    ensureListener(type, options);
  }

  return () => {
    const current = handlerRegistry.get(key);
    if (!current) return;
    current.delete(listener);
    if (current.size === 0) {
      handlerRegistry.delete(key);
    }
  };
}

export function useGlobalEvent<K extends WindowEventName>(
  type: K,
  handler: EventHandler<K>,
  options?: ListenerOptions,
) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const wrapped: EventListener = (event) =>
      handlerRef.current(event as WindowEventMap[K]);
    return registerHandler(type, wrapped, options);
  }, [type, options?.capture, options?.passive]);
}
