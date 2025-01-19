from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Vendor, VendorItem, VendorPayment
from user.serializers import UserSerializer
from transaction.models import TransactionItem
from django.db.models import Sum

class VendorItemSerializer(serializers.ModelSerializer):
    total_sold = serializers.SerializerMethodField()

    class Meta:
        model = VendorItem
        fields = ['id', 'name', 'price', 'vendor', 'total_sold']
        read_only = ['id', 'vendor']

    def get_total_sold(self, obj):
        return TransactionItem.objects.filter(vendor_item=obj).aggregate(total_sold=Sum('quantity'))['total_sold'] or 0

    def create(self, validated_data):
        print(validated_data)
        return super().create(validated_data)

class VendorPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorPayment
        fields = ['id','amount', 'vendor', 'date']
        read_only = ['id', 'vendor', 'date']


    def create(self, validated_data):
        vendor = Vendor.objects.get(id=validated_data.get('vendor').id)
        vendor.balance -= validated_data.get('amount', 0)
        vendor.save()
        return super().create(validated_data)

class VendorSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    items = VendorItemSerializer(many=True)
    payments = VendorPaymentSerializer(many=True)
    class Meta:
        model=Vendor
        fields = ['id', 'store_name', 'user', 'balance', 'street_address', 'city', 'state', 'postal_code', 'items','payments', 'ytd_sales']


    def create(self, validated_data):

        nested_user = validated_data.pop('user')
        item = validated_data.pop('items', [])
        payments = validated_data.pop('payments', [])

        vendor = Vendor.objects.create( **validated_data)
        user, created = get_user_model().objects.get_or_create(email=nested_user['email'], defaults=nested_user)
        vendor.user = user
        vendor.save()

        return vendor

    def ytd_sales(self, obj):

        return obj.yearly_sales


class VendorUpdateSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    items = VendorItemSerializer(many=True)
    class Meta:
        model=Vendor
        fields = ['id', 'store_name', 'user', 'balance', 'street_address', 'city', 'state', 'postal_code', 'items']

    def update(self, instance, validated_data):
        print('Updating Vendor')

        items = validated_data.pop('items', [])
        request = self.context.get('request', None)
        nested_user = request.data.pop('user', None)

        if(nested_user):
           print(nested_user)
           user = get_user_model().objects.get(id=nested_user['id'])
           user.name = nested_user.get('name', user.name)
           print(user.name)
           if nested_user.get('email') != user.email:
                userTest = get_user_model().objects.filter(email=nested_user.get('email'))
                if userTest:
                    raise serializers.ValidationError({'user': {'email':'A user with with email already exists'}})
                user.email = nested_user.get('email', user.email)

           user.phone_number = nested_user.get('phone_number', user.phone_number)
           user.save()

        instance.store_name = validated_data.get('store_name', instance.store_name)
        instance.balance = validated_data.get('balance', instance.balance)
        instance.street_address = validated_data.get('street_address', instance.street_address)
        instance.city = validated_data.get('city', instance.city)
        instance.state = validated_data.get('state', instance.state)
        instance.postal_code = validated_data.get('postal_code', instance.postal_code)
        instance.save()
        return instance










