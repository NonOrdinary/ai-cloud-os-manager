// src/wsClient.js

/**
 * Opens a WebSocket to the FastAPI /ws endpoint.
 * onMessage: callback invoked with parsed JSON for each message.
 */
export function createWebSocket(onMessage) {
  const ws = new WebSocket("ws://127.0.0.1:8000/ws");

  ws.onopen = () => console.log("WebSocket connected");
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (err) {
      console.error("Failed to parse WS message:", err);
    }
  };
  ws.onerror = (err) => console.error("WebSocket error", err);
  ws.onclose = () => console.log("WebSocket disconnected");

  return ws;
}
