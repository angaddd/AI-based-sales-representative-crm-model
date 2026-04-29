from django.db import models
from django.utils import timezone
from accounts.models import Company, CompanyUser
from core.models import TenantAwareModel


class Lead(TenantAwareModel):
    """Represents a lead/prospect"""
    
    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('qualified', 'Qualified'),
        ('proposal', 'Proposal'),
        ('negotiation', 'Negotiation'),
        ('won', 'Won'),
        ('lost', 'Lost'),
        ('unqualified', 'Unqualified'),
    ]
    
    # Basic info
    unique_identifier = models.CharField(max_length=255, unique=True, help_text="Unique user ID from tracking SDK")
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    company_name = models.CharField(max_length=255, blank=True)
    
    # Lead scoring
    score = models.IntegerField(default=0)
    temperature = models.CharField(
        max_length=10,
        choices=[('hot', 'Hot'), ('warm', 'Warm'), ('cold', 'Cold')],
        default='cold'
    )
    conversion_rate = models.FloatField(default=0.0, help_text="Estimated conversion probability 0-1")
    
    # Engagement
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    assigned_to = models.ForeignKey(
        CompanyUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='leads'
    )
    
    # Tracking
    first_seen = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(null=True, blank=True)
    
    # Engagement metrics
    total_visits = models.IntegerField(default=1)
    total_clicks = models.IntegerField(default=0)
    time_spent_seconds = models.IntegerField(default=0)
    pages_visited = models.JSONField(default=list)
    
    class Meta:
        ordering = ['-score', '-last_seen']
        indexes = [
            models.Index(fields=['company', 'unique_identifier']),
            models.Index(fields=['company', 'temperature']),
            models.Index(fields=['company', 'status']),
            models.Index(fields=['last_seen']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email
    
    @property
    def days_since_first_seen(self):
        """Calculate days since first seen"""
        return (timezone.now() - self.first_seen).days
    
    @property
    def days_since_last_activity(self):
        """Calculate days since last activity"""
        if self.last_activity:
            return (timezone.now() - self.last_activity).days
        return self.days_since_first_seen


class Event(TenantAwareModel):
    """Tracks user events (page views, clicks, cart adds, etc.)"""
    
    EVENT_TYPES = [
        ('page_view', 'Page View'),
        ('click', 'Click'),
        ('scroll', 'Scroll'),
        ('form_start', 'Form Started'),
        ('form_submit', 'Form Submitted'),
        ('add_to_cart', 'Add to Cart'),
        ('remove_from_cart', 'Remove from Cart'),
        ('view_product', 'View Product'),
        ('start_checkout', 'Start Checkout'),
        ('complete_purchase', 'Complete Purchase'),
        ('time_spent', 'Time Spent'),
        ('custom', 'Custom Event'),
    ]
    
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='events')
    unique_identifier = models.CharField(max_length=255, db_index=True)
    
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)
    event_data = models.JSONField(default=dict, help_text="Additional event data")
    
    url = models.URLField(blank=True)
    session_id = models.CharField(max_length=255, db_index=True)
    
    # Engagement details
    element_id = models.CharField(max_length=255, blank=True)
    element_text = models.CharField(max_length=500, blank=True)
    page_depth = models.IntegerField(default=0)
    
    # Behavioral signals
    intent_signal = models.CharField(
        max_length=20,
        choices=[
            ('high', 'High'),
            ('medium', 'Medium'),
            ('low', 'Low'),
            ('neutral', 'Neutral'),
        ],
        default='neutral'
    )
    
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['company', 'lead']),
            models.Index(fields=['unique_identifier', 'timestamp']),
            models.Index(fields=['event_type', 'timestamp']),
            models.Index(fields=['session_id']),
        ]
    
    def __str__(self):
        return f"{self.get_event_type_display()} - {self.unique_identifier}"


class LeadScore(TenantAwareModel):
    """Historical record of lead score changes"""
    
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='score_history')
    
    # Score at this point in time
    score = models.IntegerField()
    temperature = models.CharField(
        max_length=10,
        choices=[('hot', 'Hot'), ('warm', 'Warm'), ('cold', 'Cold')]
    )
    
    # What contributed to this score
    contributing_events = models.IntegerField(help_text="Number of events since last score")
    engine_version = models.CharField(max_length=50, default='1.0')
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [models.Index(fields=['lead', '-timestamp'])]
    
    def __str__(self):
        return f"{self.lead} - Score: {self.score} ({self.temperature})"


class Recommendation(TenantAwareModel):
    """AI-generated recommendations for sales actions"""
    
    RECOMMENDATION_TYPES = [
        ('call', 'Call Lead'),
        ('email', 'Send Email'),
        ('retarget', 'Retarget Ad'),
        ('follow_up', 'Follow Up'),
        ('demo', 'Schedule Demo'),
        ('proposal', 'Send Proposal'),
        ('close', 'Close Deal'),
    ]
    
    PRIORITY_CHOICES = [
        ('urgent', 'Urgent'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='recommendations')
    assigned_to = models.ForeignKey(
        CompanyUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recommendations'
    )
    
    recommendation_type = models.CharField(max_length=50, choices=RECOMMENDATION_TYPES)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    confidence_score = models.FloatField(help_text="How confident is the AI in this recommendation")
    reasoning = models.TextField(help_text="Why the AI made this recommendation")
    
    # Status tracking
    is_actioned = models.BooleanField(default=False)
    actioned_at = models.DateTimeField(null=True, blank=True)
    action_notes = models.TextField(blank=True)
    
    is_dismissed = models.BooleanField(default=False)
    dismissed_at = models.DateTimeField(null=True, blank=True)
    
    generated_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        ordering = ['-priority', '-confidence_score', '-generated_at']
        indexes = [
            models.Index(fields=['company', 'lead', '-generated_at']),
            models.Index(fields=['is_actioned']),
            models.Index(fields=['priority']),
        ]
    
    def __str__(self):
        return f"{self.get_recommendation_type_display()} - {self.lead}"
