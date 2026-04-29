from django.urls import path, include
from rest_framework.routers import DefaultRouter
from crm.views import LeadViewSet, EventViewSet, RecommendationViewSet

router = DefaultRouter()
router.register(r'leads', LeadViewSet, basename='lead')
router.register(r'events', EventViewSet, basename='event')
router.register(r'recommendations', RecommendationViewSet, basename='recommendation')

urlpatterns = [
    path('', include(router.urls)),
]
