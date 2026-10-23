import { EventEmitter } from "events";

// Global singleton event emitter for in-process real-time commerce events
declare global {
  // eslint-disable-next-line no-var
  var __ofiaCommerceEmitter: EventEmitter | undefined;
}

const emitter: EventEmitter = global.__ofiaCommerceEmitter || new EventEmitter();
emitter.setMaxListeners(200);

if (process.env.NODE_ENV !== "production") {
  global.__ofiaCommerceEmitter = emitter;
}

export interface CommerceStreamEvent {
  type: "ORDER_CREATED" | "ORDER_STATUS_CHANGED" | "INVENTORY_LOW_STOCK" | "HEARTBEAT";
  tenantSlug: string;
  timestamp: string;
  data: any;
}

export function publishCommerceEvent(tenantSlug: string, event: Omit<CommerceStreamEvent, "tenantSlug" | "timestamp">) {
  if (!tenantSlug) return;
  const cleanSlug = tenantSlug.toLowerCase().trim();
  const payload: CommerceStreamEvent = {
    ...event,
    tenantSlug: cleanSlug,
    timestamp: new Date().toISOString(),
  };

  emitter.emit(`commerce:${cleanSlug}`, payload);
  emitter.emit("commerce:global", payload);
}

export function subscribeCommerceEvents(
  tenantSlug: string,
  listener: (event: CommerceStreamEvent) => void
): () => void {
  if (!tenantSlug) return () => {};
  const cleanSlug = tenantSlug.toLowerCase().trim();
  const channel = `commerce:${cleanSlug}`;

  emitter.on(channel, listener);
  return () => {
    emitter.off(channel, listener);
  };
}
