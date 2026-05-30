import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";

export const usePhotoCommentSocket = (
  photoId: number,
  onMessage: (data: any) => void
) => {
  const socketRef = useRef<WebSocket | null>(null);
  const token = useSelector(
    (state: RootState) => state.auth.access
  );

  useEffect(() => {
    if (!token || !photoId) return;

    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/photos/${photoId}/comments/?token=${token}`
    );

    ws.onopen = () => console.log(`💬 Photo ${photoId} comments WS connected`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    ws.onerror = (err) => console.error("WS error", err);

    ws.onclose = () => console.log(`🔕 Photo ${photoId} comments WS closed`);

    socketRef.current = ws;

    return () => {
      ws.close();
    };
  }, [token, photoId]);
};
