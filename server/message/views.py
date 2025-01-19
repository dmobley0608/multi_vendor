from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Message
from .serializers import MessageSerializer

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all().order_by('-timestamp')
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    def get_queryset(self):
        user = self.request.user

        return Message.objects.filter(recipients=user).distinct().order_by('-timestamp') | Message.objects.filter(sender=user).distinct().order_by('-timestamp')


    def perform_update(self, serializer):
        instance = serializer.save()
        if not instance.is_read:
            instance.is_read = True
            instance.save()

    @action(detail=True, methods=['patch'], url_path='read')
    def mark_as_read(self, request, pk=None):
        message = self.get_object()
        message.is_read = True
        message.save()
        return Response({'status': 'message marked as read'})

    @action(detail=False, methods=['get'], url_path='staff')
    def get_staff(self, request):
        print('get_staff')
        staff_members = get_user_model().objects.filter(is_staff=True)
        staff_data = [{'id': staff.id} for staff in staff_members]
        return Response(staff_data)
