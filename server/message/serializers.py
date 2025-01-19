from rest_framework import serializers
from .models import Message
from vendor.models import Vendor
from user.models import User
from rest_framework import status
from rest_framework.response import Response



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email']

class MessageSerializer( serializers.ModelSerializer):
    recipients = UserSerializer(many=True, read_only=True)
    recipient_ids = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True, write_only=True)
    sender_email = serializers.CharField(source='sender.email', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_email', 'recipients', 'recipient_ids', 'subject', 'body', 'timestamp', 'is_read']
        read_only_fields = ['sender', 'timestamp', 'is_read']

    def create(self, validated_data):
        recipient_ids = validated_data.pop('recipient_ids', [])
        user = self.context['request'].user
        message = Message.objects.create(**validated_data)
        message.sender = user
        if user.is_staff:
            for recipient in recipient_ids:
                message.recipients.add(recipient)
        else:
            staff = User.objects.filter(is_staff=True)
            message.recipients.add(*staff)
        message.save()
        return message

    def update(self, instance, validated_data):
        recipient_ids = validated_data.pop('recipient_ids', [])
        instance = super().update(instance, validated_data)
        instance.recipients.set(recipient_ids)
        return instance
