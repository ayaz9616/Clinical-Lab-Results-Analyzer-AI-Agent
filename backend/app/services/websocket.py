from fastapi import WebSocket
from typing import Dict, Any

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]

    async def send_state(self, client_id: str, state: Dict[str, Any]):
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_json(state)
            except Exception as e:
                print(f"Error sending state to {client_id}: {e}")
                self.disconnect(client_id)

manager = ConnectionManager()
