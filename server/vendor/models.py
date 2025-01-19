from django.db import models
from django.contrib.auth import get_user_model

# Create your models here.

class Vendor(models.Model):
    id = models.IntegerField(primary_key=True, unique=True)
    user = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, null=True, blank=True, related_name='store' )
    store_name = models.CharField(max_length=255, null=True, blank=True)
    street_address = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=255, null=True, blank=True)
    state = models.CharField(max_length=255, null=True, blank=True)
    postal_code = models.CharField(max_length=255, null=True, blank=True)
    balance = models.IntegerField(default=0)

    @property
    def ytd_sales(self):
        yearly_sales = 1000
        return yearly_sales


    def __str__(self):
        return self.store_name or self.user.name

class VendorItem(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=255)
    price = models.IntegerField()

    def __str__(self):
        return f'{self.vendor.store_name} -{self.id}- {self.name} - {self.price}'

class VendorPayment(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='payments')
    amount = models.IntegerField()
    date = models.DateField(auto_created=True, auto_now_add=True)


    def __str__(self):
        return f'{self.vendor.store_name} - {self.amount} - {self.date}'