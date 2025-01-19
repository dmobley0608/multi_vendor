from django.db import models
from django.contrib.auth import get_user_model
from vendor.models import Vendor

User = get_user_model()

class Message(models.Model):
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    recipients = models.ManyToManyField(User, related_name='received_messages', blank=True)
    subject = models.CharField(max_length=255)
    body = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f'Message from {self.sender} - {self.subject}'
