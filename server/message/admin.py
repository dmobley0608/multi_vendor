from django.contrib import admin
from .models import Message

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'sender', 'get_recipients', 'subject', 'timestamp', 'is_read']
    search_fields = ['sender__user__name', 'recipients__user__name', 'subject']
    list_filter = ['timestamp', 'is_read']

    def get_recipients(self, obj):
        return ", ".join([user.name for user in obj.recipients.all()])
    get_recipients.short_description = 'Recipients'

