from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet, TransactionItemViewSet
from . import views

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet)
router.register(r'transaction-items', TransactionItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('top-vendors', views.top_vendors, name='top_vendors'),
    path('top-items', views.top_items, name='top_items'),
]
