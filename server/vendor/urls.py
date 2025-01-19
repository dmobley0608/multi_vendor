from django.urls import path, include
from rest_framework.routers import DefaultRouter

from vendor import views

router = DefaultRouter()
router.register('vendor', views.VendorViewSet)
router.register('vendor-item', views.VendorItemViewset)
router.register('vendor-payment', views.VendorPaymentViewset)

app_name = 'vendor'

urlpatterns = [
    path('vendor/user/', views.VendorByUserView.as_view(), name='vendor-by-user'),
    path('', include(router.urls)),

]