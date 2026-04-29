from django.urls import path, include
from rest_framework.routers import DefaultRouter
from accounts.views import AuthViewSet, CompanyViewSet, CompanyUserViewSet

router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'users', CompanyUserViewSet, basename='company-user')

urlpatterns = [
    path('', include(router.urls)),
]
