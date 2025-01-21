import uuid
from django.db import models
from vendor.models import VendorItem
# Create your models here.
class Transaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    PAYMENT_METHOD_CHOICES = [
        ('CASH', 'Cash'),
        ('CARD', 'Card'),
    ]

    date = models.DateTimeField(auto_now_add=True)
    sub_total = models.IntegerField()
    sales_tax = models.IntegerField()
    card_fee = models.IntegerField(null=True, blank=True)
    payment_method = models.CharField(
        max_length=4,
        choices=PAYMENT_METHOD_CHOICES,
        default='CASH'
    )
    grand_total = models.IntegerField()

    def calculate_grand_total(self):
        self.grand_total = self.sub_total + self.sales_tax + (self.card_fee or 0)

    def save(self, *args, **kwargs):
        self.calculate_grand_total()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'Transaction {self.id} - {self.date}'

class TransactionItem(models.Model):
    transaction = models.ForeignKey(Transaction, related_name='items', on_delete=models.CASCADE)
    vendor_item = models.ForeignKey(VendorItem, on_delete=models.SET_NULL, null=True)
    price = models.IntegerField()
    quantity = models.PositiveIntegerField()
    total = models.IntegerField()
    vendor_fee = models.IntegerField()
    sold_by = models.CharField(max_length=255, default='')
    name = models.CharField(max_length=255, default='')

    def calculate_total(self):
        self.total = self.price * self.quantity
        self.vendor_fee = int(self.total * 0.05)

    def save(self, *args, **kwargs):
        self.calculate_total()
        if self.vendor_item and self.vendor_item.vendor:
            self.sold_by = self.vendor_item.vendor.store_name or self.vendor_item.vendor.user.name
        else:
            self.sold_by = 'Unknown'
        if self.vendor_item:
            self.name = self.vendor_item.name
        else:
            self.name = 'Unknown'
        super().save(*args, **kwargs)