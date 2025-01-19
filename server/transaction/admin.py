from django.contrib import admin
from .models import Transaction, TransactionItem

class TransactionItemInline(admin.TabularInline):
    model = TransactionItem
    extra = 1

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    inlines = [TransactionItemInline]
    list_display = ['id', 'date', 'sub_total', 'sales_tax', 'payment_method', 'grand_total']
    search_fields = ['id', 'date', 'payment_method']
    list_filter = ['date', 'payment_method']

@admin.register(TransactionItem)
class TransactionItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'transaction', 'vendor_item', 'price', 'quantity', 'total', 'vendor_fee']
    search_fields = ['transaction__id', 'vendor_item__name']
    list_filter = ['transaction__date']
