from rest_framework import serializers
from .models import Transaction, TransactionItem

class TransactionItemSerializer(serializers.ModelSerializer):
    vendor_fee = serializers.IntegerField(read_only=True)

    class Meta:
        model = TransactionItem
        fields = ['id', 'name','vendor_item', 'price', 'quantity', 'total', 'vendor_fee',  'sold_by']

class TransactionSerializer(serializers.ModelSerializer):
    items = TransactionItemSerializer(many=True)

    class Meta:
        model = Transaction
        fields = ['id', 'date', 'sub_total', 'sales_tax', 'payment_method', 'grand_total', 'items','card_fee']

    def create(self, validated_data):
        print(validated_data)
        items_data = validated_data.pop('items')
        transaction = Transaction.objects.create(**validated_data)
        for item_data in items_data:
            TransactionItem.objects.create(transaction=transaction, **item_data)
        return transaction

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items')
        instance.sub_total = validated_data.get('sub_total', instance.sub_total)
        instance.sales_tax = validated_data.get('sales_tax', instance.sales_tax)
        instance.payment_method = validated_data.get('payment_method', instance.payment_method)
        instance.card_fee = validated_data.get('card_fee', instance.card_fee)
        instance.save()

        for item_data in items_data:
            item_id = item_data.get('id')
            if item_id:
                item = TransactionItem.objects.get(id=item_id, transaction=instance)
                item.price = item_data.get('price', item.price)
                item.quantity = item_data.get('quantity', item.quantity)
                item.save()
            else:
                TransactionItem.objects.create(transaction=instance, **item_data)
        return instance
