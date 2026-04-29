from rest_framework import serializers
from crm.models import Lead, Event, LeadScore, Recommendation
from accounts.serializers import CompanyUserSerializer


class EventSerializer(serializers.ModelSerializer):
    """Serialize Event model"""
    
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)
    
    class Meta:
        model = Event
        fields = ['id', 'event_type', 'event_type_display', 'event_data', 'url',
                  'element_text', 'page_depth', 'intent_signal', 'timestamp']
        read_only_fields = ['timestamp']


class LeadScoreSerializer(serializers.ModelSerializer):
    """Serialize LeadScore model"""
    
    class Meta:
        model = LeadScore
        fields = ['id', 'score', 'temperature', 'contributing_events', 'timestamp']
        read_only_fields = ['timestamp']


class RecommendationSerializer(serializers.ModelSerializer):
    """Serialize Recommendation model"""
    
    assigned_to_display = CompanyUserSerializer(source='assigned_to', read_only=True)
    recommendation_type_display = serializers.CharField(source='get_recommendation_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = Recommendation
        fields = ['id', 'recommendation_type', 'recommendation_type_display', 'priority',
                  'priority_display', 'title', 'description', 'confidence_score',
                  'reasoning', 'is_actioned', 'assigned_to_display', 'generated_at',
                  'expires_at']
        read_only_fields = ['generated_at', 'expires_at']


class LeadListSerializer(serializers.ModelSerializer):
    """Simplified serializer for lead lists"""
    
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    temperature_display = serializers.CharField(source='get_temperature_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    assigned_to_display = CompanyUserSerializer(source='assigned_to', read_only=True)
    
    class Meta:
        model = Lead
        fields = ['id', 'unique_identifier', 'full_name', 'email', 'score',
                  'temperature', 'temperature_display', 'status', 'status_display',
                  'total_visits', 'time_spent_seconds', 'last_seen', 'assigned_to_display']


class LeadDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for lead detail view"""
    
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    temperature_display = serializers.CharField(source='get_temperature_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    events = EventSerializer(many=True, read_only=True)
    score_history = LeadScoreSerializer(many=True, read_only=True)
    recommendations = RecommendationSerializer(many=True, read_only=True)
    assigned_to_display = CompanyUserSerializer(source='assigned_to', read_only=True)
    days_since_first_seen = serializers.IntegerField(read_only=True)
    days_since_last_activity = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Lead
        fields = ['id', 'unique_identifier', 'full_name', 'email', 'phone',
                  'company_name', 'score', 'temperature', 'temperature_display',
                  'conversion_rate', 'status', 'status_display', 'assigned_to_display',
                  'total_visits', 'total_clicks', 'time_spent_seconds', 'pages_visited',
                  'first_seen', 'last_seen', 'last_activity',
                  'days_since_first_seen', 'days_since_last_activity',
                  'events', 'score_history', 'recommendations']


class LeadCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating leads"""
    
    class Meta:
        model = Lead
        fields = ['email', 'phone', 'first_name', 'last_name', 'company_name',
                  'status', 'assigned_to']
