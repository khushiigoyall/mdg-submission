from django.urls import path
from .consumers import NotificationConsumer
from photos.consumers import PhotoCommentConsumer

websocket_urlpatterns = [
    path("ws/notifications/", NotificationConsumer.as_asgi()),
    path("ws/photos/<int:photo_id>/comments/", PhotoCommentConsumer.as_asgi()),
]
