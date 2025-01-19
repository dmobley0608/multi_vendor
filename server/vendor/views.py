from rest_framework import viewsets, mixins
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from .models import Vendor, VendorItem, VendorPayment
from transaction.models import TransactionItem
from .serializers import VendorSerializer, VendorItemSerializer, VendorUpdateSerializer, VendorPaymentSerializer

class VendorViewSet(viewsets.ModelViewSet):
    serializer_class = VendorSerializer
    queryset = Vendor.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'update':
            return VendorUpdateSerializer
        return self.serializer_class

    def get_queryset(self):
        if self.request.user.is_staff:
            return self.queryset.order_by('id')
        else:
            return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        print("Creating Vendor")
        return super().perform_create(serializer)

    def perform_update(self, serializer):

        return super().perform_update(serializer)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user = instance.user
        user.delete()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class VendorItemViewset(viewsets.ModelViewSet):
    serializer_class = VendorItemSerializer
    queryset = VendorItem.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:

            return self.queryset.order_by('name')
        else:
            vendor = Vendor.objects.get(user = self.request.user)
            return self.queryset.filter(vendor=vendor)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        for item in queryset:
            item.sold = TransactionItem.objects.filter(vendor_item=item).aggregate(total_sold=Sum('quantity'))['total_sold'] or 0
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        print("Creating New Vendor Item")
        return super().perform_create(serializer)

class VendorPaymentViewset(viewsets.ModelViewSet):
    serializer_class = VendorPaymentSerializer
    queryset = VendorPayment.objects.all().order_by('date')
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return self.queryset.order_by('-date')
        else:
            vendor = Vendor.objects.get(user = self.request.user)
            return self.queryset.filter(vendor=vendor).order_by('-date')

    def perform_create(self, serializer):
        return super().perform_create(serializer)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.vendor.balance += instance.amount
        instance.vendor.save()
        return super().destroy(request, *args, **kwargs)

class VendorByUserView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            vendor = Vendor.objects.get(user=request.user)
            print(vendor)
            serializer = VendorSerializer(vendor)
            return Response(serializer.data)
        except Vendor.DoesNotExist:
            print("Vendor not found")
            return Response({"detail": "Vendor not found."}, status=status.HTTP_404_NOT_FOUND)