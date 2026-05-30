from channels.generic.websocket import AsyncJsonWebsocketConsumer

class PhotoCommentConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.photo_id = self.scope['url_route']['kwargs']['photo_id']
        self.group_name = f"photo_{self.photo_id}"
        
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def send_comment(self, event):
        await self.send_json(event["data"])
