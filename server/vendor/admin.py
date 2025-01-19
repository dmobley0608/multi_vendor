from django.contrib import admin
from .models import Vendor, VendorItem, VendorPayment
# Register your models here.

class VendorPaymentInline(admin.TabularInline):
    model = VendorPayment
    extra=1

class VendorItemInline(admin.TabularInline):
    model = VendorItem
    extra=1

class VendorAdmin(admin.ModelAdmin):
    ordering = ['id']
    list_display = ['id','store_name', 'user', 'balance','street_address', 'city', 'state', 'postal_code']
    inlines=[VendorItemInline, VendorPaymentInline]


admin.site.register(Vendor, VendorAdmin)
admin.site.register(VendorItem)



