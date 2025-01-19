from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from .models import Transaction, TransactionItem
from .serializers import TransactionSerializer, TransactionItemSerializer
from django.http import JsonResponse
from django.db.models import Sum, F
from django.utils import timezone
from datetime import timedelta

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all().order_by('-date')
    serializer_class = TransactionSerializer

    def perform_create(self, serializer):
        transaction = serializer.save()
        for item in transaction.items.all():
            if item.vendor_item:
                vendor = item.vendor_item.vendor
                item.sold_by = vendor.store_name or vendor.user.name
                item.name = item.vendor_item.name
                vendor.balance += item.vendor_fee
                vendor.save()

    def perform_update(self, serializer):
        transaction = serializer.save()
        for item in transaction.items.all():
            if item.vendor_item:
                vendor = item.vendor_item.vendor
                vendor.balance +=  item.vendor_fee
                vendor.save()

    def perform_destroy(self, instance):
        for item in instance.items.all():
            if item.vendor_item:
                vendor = item.vendor_item.vendor
                vendor.balance -= item.vendor_fee
                vendor.save()
        instance.delete()

class TransactionItemViewSet(viewsets.ModelViewSet):
    queryset = TransactionItem.objects.all()
    serializer_class = TransactionItemSerializer

def top_vendors(request):
    now = timezone.now()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    year_ago = now - timedelta(days=365)

    top_vendors_week = TransactionItem.objects.filter(
        transaction__date__gte=week_ago
    ).values('vendor_item__vendor__id', 'vendor_item__vendor__store_name').annotate(
        itemsSold=Sum('quantity'),
        totalAmount=Sum(F('quantity') * F('price'))
    ).order_by('-totalAmount')[:10]

    top_vendors_month = TransactionItem.objects.filter(
        transaction__date__gte=month_ago
    ).values('vendor_item__vendor__id', 'vendor_item__vendor__store_name').annotate(
        itemsSold=Sum('quantity'),
        totalAmount=Sum(F('quantity') * F('price'))
    ).order_by('-totalAmount')[:10]

    top_vendors_year = TransactionItem.objects.filter(
        transaction__date__gte=year_ago
    ).values('vendor_item__vendor__id', 'vendor_item__vendor__store_name').annotate(
        itemsSold=Sum('quantity'),
        totalAmount=Sum(F('quantity') * F('price'))
    ).order_by('-totalAmount')[:10]

    top_vendors_data = {
        'week': list(top_vendors_week),
        'month': list(top_vendors_month),
        'year': list(top_vendors_year),
    }

    return JsonResponse(top_vendors_data, safe=False)

def top_items(request):
    now = timezone.now()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    year_ago = now - timedelta(days=365)

    top_items_week = TransactionItem.objects.filter(
        transaction__date__gte=week_ago
    ).values('vendor_item__id', 'vendor_item__name').annotate(
        itemsSold=Sum('quantity'),
        totalAmount=Sum(F('quantity') * F('price'))
    ).order_by('-itemsSold')[:10]

    top_items_month = TransactionItem.objects.filter(
        transaction__date__gte=month_ago
    ).values('vendor_item__id', 'vendor_item__name').annotate(
        itemsSold=Sum('quantity'),
        totalAmount=Sum(F('quantity') * F('price'))
    ).order_by('-itemsSold')[:10]

    top_items_year = TransactionItem.objects.filter(
        transaction__date__gte=year_ago
    ).values('vendor_item__id', 'vendor_item__name').annotate(
        itemsSold=Sum('quantity'),
        totalAmount=Sum(F('quantity') * F('price'))
    ).order_by('-itemsSold')[:10]

    top_items_data = {
        'week': list(top_items_week),
        'month': list(top_items_month),
        'year': list(top_items_year),
    }

    return JsonResponse(top_items_data, safe=False)
