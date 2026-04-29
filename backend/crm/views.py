from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q, Count, Sum, Avg
from datetime import timedelta

from crm.models import Lead, Event, LeadScore, Recommendation
from crm.serializers import (
    LeadListSerializer, LeadDetailSerializer, LeadCreateUpdateSerializer,
    EventSerializer, RecommendationSerializer
)
from accounts.models import CompanyUser


class LeadViewSet(viewsets.ModelViewSet):
    """Manage leads"""
    
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'temperature']
    search_fields = ['email', 'first_name', 'last_name', 'company_name', 'unique_identifier']
    ordering_fields = ['score', 'last_seen', 'created_at']
    ordering = ['-score', '-last_seen']
    
    def get_company_id(self):
        """Get company ID from request context"""
        try:
            company_user = CompanyUser.objects.get(user=self.request.user)
            return company_user.company_id
        except CompanyUser.DoesNotExist:
            return None
    
    def get_queryset(self):
        """Return leads for current company"""
        company_id = self.get_company_id()
        if not company_id:
            return Lead.objects.none()
        return Lead.objects.filter(company_id=company_id).prefetch_related(
            'events', 'score_history', 'recommendations'
        )
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'retrieve':
            return LeadDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return LeadCreateUpdateSerializer
        else:
            return LeadListSerializer
    
    def perform_create(self, serializer):
        """Set company when creating lead"""
        company_id = self.get_company_id()
        serializer.save(company_id=company_id)
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get analytics summary for all leads"""
        company_id = self.get_company_id()
        if not company_id:
            return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)
        
        leads = Lead.objects.filter(company_id=company_id)
        
        # Time filters
        timeframe = request.query_params.get('timeframe', '30')  # days
        days = int(timeframe)
        since = timezone.now() - timedelta(days=days)
        
        recent_leads = leads.filter(created_at__gte=since)
        
        analytics = {
            'total_leads': leads.count(),
            'hot_leads': leads.filter(temperature='hot').count(),
            'warm_leads': leads.filter(temperature='warm').count(),
            'cold_leads': leads.filter(temperature='cold').count(),
            'new_leads_period': recent_leads.count(),
            'avg_score': leads.aggregate(Avg('score'))['score__avg'] or 0,
            'avg_conversion_rate': leads.aggregate(Avg('conversion_rate'))['conversion_rate__avg'] or 0,
            'total_visits': leads.aggregate(Sum('total_visits'))['total_visits__sum'] or 0,
            'total_time_spent': leads.aggregate(Sum('time_spent_seconds'))['time_spent_seconds__sum'] or 0,
            'by_status': {
                status_choice[0]: leads.filter(status=status_choice[0]).count()
                for status_choice in Lead.STATUS_CHOICES
            }
        }
        
        return Response(analytics)
    
    @action(detail=True, methods=['post'])
    def assign(self, request):
        """Assign lead to sales rep"""
        lead = self.get_object()
        assigned_to_id = request.data.get('assigned_to_id')
        
        if assigned_to_id:
            try:
                company_user = CompanyUser.objects.get(
                    id=assigned_to_id,
                    company_id=lead.company_id
                )
                lead.assigned_to = company_user
                lead.save()
            except CompanyUser.DoesNotExist:
                return Response(
                    {'error': 'User not found in company'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            lead.assigned_to = None
            lead.save()
        
        return Response(LeadDetailSerializer(lead).data)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request):
        """Update lead status"""
        lead = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status or new_status not in dict(Lead.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        lead.status = new_status
        lead.save()
        return Response(LeadDetailSerializer(lead).data)


class EventViewSet(viewsets.CreateModelViewSet):
    """Track and retrieve events"""
    
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]
    
    def get_company_id(self):
        """Get company ID from request context"""
        try:
            company_user = CompanyUser.objects.get(user=self.request.user)
            return company_user.company_id
        except CompanyUser.DoesNotExist:
            return None
    
    @action(detail=False, methods=['post'])
    def track(self, request):
        """Track user event from SDK"""
        company_id = self.get_company_id()
        unique_identifier = request.data.get('unique_identifier')
        event_type = request.data.get('event_type')
        event_data = request.data.get('event_data', {})
        session_id = request.data.get('session_id', '')
        url = request.data.get('url', '')
        
        if not unique_identifier or not event_type:
            return Response(
                {'error': 'unique_identifier and event_type required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create lead
        lead, created = Lead.objects.get_or_create(
            company_id=company_id,
            unique_identifier=unique_identifier,
            defaults={
                'email': event_data.get('email', ''),
                'first_name': event_data.get('first_name', ''),
                'last_name': event_data.get('last_name', ''),
            }
        )
        
        # Create event
        event = Event.objects.create(
            company_id=company_id,
            lead=lead,
            unique_identifier=unique_identifier,
            event_type=event_type,
            event_data=event_data,
            session_id=session_id,
            url=url,
            element_id=event_data.get('element_id', ''),
            element_text=event_data.get('element_text', ''),
            page_depth=event_data.get('page_depth', 0),
            intent_signal=self._calculate_intent_signal(event_type, event_data),
        )
        
        # Update lead engagement metrics
        lead.last_activity = timezone.now()
        if event_type == 'page_view':
            lead.total_visits += 1
            if url and url not in lead.pages_visited:
                lead.pages_visited.append(url)
        elif event_type == 'click':
            lead.total_clicks += 1
        elif event_type == 'time_spent':
            lead.time_spent_seconds += event_data.get('seconds', 0)
        
        lead.save()
        
        return Response(
            EventSerializer(event).data,
            status=status.HTTP_201_CREATED
        )
    
    @staticmethod
    def _calculate_intent_signal(event_type, event_data):
        """Calculate purchase intent from event"""
        high_intent_events = {
            'add_to_cart': 'high',
            'start_checkout': 'high',
            'complete_purchase': 'high',
            'view_product': 'medium',
            'click': 'medium',
            'form_submit': 'high',
            'form_start': 'medium',
        }
        return high_intent_events.get(event_type, 'neutral')


class RecommendationViewSet(viewsets.ReadOnlyModelViewSet):
    """View recommendations"""
    
    serializer_class = RecommendationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['is_actioned', 'priority']
    ordering = ['-priority', '-confidence_score']
    
    def get_company_id(self):
        """Get company ID from request context"""
        try:
            company_user = CompanyUser.objects.get(user=self.request.user)
            return company_user.company_id
        except CompanyUser.DoesNotExist:
            return None
    
    def get_queryset(self):
        """Return recommendations for current company"""
        company_id = self.get_company_id()
        if not company_id:
            return Recommendation.objects.none()
        
        return Recommendation.objects.filter(
            company_id=company_id,
            is_dismissed=False,
            expires_at__gt=timezone.now()
        ).prefetch_related('lead', 'assigned_to')
    
    @action(detail=True, methods=['post'])
    def action(self, request):
        """Mark recommendation as actioned"""
        recommendation = self.get_object()
        action_notes = request.data.get('action_notes', '')
        
        recommendation.is_actioned = True
        recommendation.actioned_at = timezone.now()
        recommendation.action_notes = action_notes
        recommendation.save()
        
        return Response(RecommendationSerializer(recommendation).data)
    
    @action(detail=True, methods=['post'])
    def dismiss(self, request):
        """Dismiss recommendation"""
        recommendation = self.get_object()
        
        recommendation.is_dismissed = True
        recommendation.dismissed_at = timezone.now()
        recommendation.save()
        
        return Response({'status': 'dismissed'})
