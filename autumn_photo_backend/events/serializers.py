from rest_framework import serializers
from .models import Event
from accounts.models import User

class CoordinatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name']

class EventSerializer(serializers.ModelSerializer):
    coordinators = CoordinatorSerializer(many=True, read_only=True)
    coordinator_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        source='coordinators',
        write_only=True
    )

    cover = serializers.SerializerMethodField()
    cover_upload = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = Event
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'start_datetime',
            'end_datetime',
            'location',
            'qr_code_url',
            'is_public',
            'created_at',            
            'cover_photo',
            'cover',
            'cover_upload',
            'created_by',
            'coordinators',
            'coordinator_ids',
        ]
        read_only_fields = ['id', 'created_at', 'created_by']

    def update(self, instance, validated_data):
        cover = validated_data.pop('cover_upload', None)
        
        instance = super().update(instance, validated_data)

        if cover is not None:
            from photos.models import Photo
            try:
                user = self.context['request'].user
                photo = Photo.objects.create(
                    event=instance,
                    uploader=user if user.is_authenticated else None,
                    original_file=cover,
                    display_file=cover,
                    thumbnail_file=cover,
                )
                instance.cover_photo = photo
                instance.save()
            except Exception:
                pass

        return instance

    def get_cover(self, obj):
        photo = obj.cover_photo
        if not photo:
            return None

        
        if getattr(photo, 'thumbnail_file', None) and photo.thumbnail_file:
            return photo.thumbnail_file.url

        if getattr(photo, 'display_file', None) and photo.display_file:
            return photo.display_file.url

        if getattr(photo, 'original_file', None) and photo.original_file:
            return photo.original_file.url

        return None
