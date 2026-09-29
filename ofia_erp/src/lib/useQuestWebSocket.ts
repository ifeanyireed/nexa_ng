"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface QuestWsMessage {
  type: "CONNECTED" | "SCORE_UPDATED" | "SCHEDULE_UPDATED" | "CONCEPT_UPDATED" | "ROSTER_UPDATED" | "QUEST_UPDATED";
  quest_id: string;
  timestamp: string;
  data?: any;
}

export function useQuestWebSocket(
  questId: string,
  onMessage?: (msg: QuestWsMessage) => void
) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<QuestWsMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onMessageRef = useRef(onMessage);

  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (typeof window === "undefined" || !questId) return;

    // Determine WS protocol & host
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname;
    // Default Go service_erp port is 8084 in local development, or relative if behind reverse proxy
    const wsPort = process.env.NEXT_PUBLIC_ERP_WS_PORT || "8084";
    const wsUrl = `${protocol}//${host}:${wsPort}/quests/ws?quest_id=${encodeURIComponent(questId)}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg: QuestWsMessage = JSON.parse(event.data);
          setLastMessage(msg);
          if (onMessageRef.current) {
            onMessageRef.current(msg);
          }
        } catch (e) {
          // ignore raw text ping
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Exponential backoff reconnect
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 4000);
      };

      ws.onerror = () => {
        setIsConnected(false);
        ws.close();
      };
    } catch (err) {
      setIsConnected(false);
    }
  }, [questId]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected, lastMessage };
}
