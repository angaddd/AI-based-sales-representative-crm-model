from django.db import models
from django.contrib.auth.models import User
from core.models import TenantAwareModel


class Company(models.Model):
    """Represents a tenant/company in the system"""
    
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(unique=True, help_text="URL-friendly name")
    description = models.TextField(blank=True)
    industry = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    
    # Account info
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    
    # Subscription
    is_active = models.BooleanField(default=True)
    plan = models.CharField(
        max_length=50,
        choices=[('free', 'Free'), ('pro', 'Pro'), ('enterprise', 'Enterprise')],
        default='free'
    )
    max_users = models.IntegerField(default=5)
    max_leads = models.IntegerField(default=100)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        indexes = [models.Index(fields=['slug']), models.Index(fields=['is_active'])]
    
    def __str__(self):
        return self.name


class CompanyUser(models.Model):
    """Represents a user within a company"""
    
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('sales_rep', 'Sales Representative'),
        ('analyst', 'Analyst'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='users')
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='sales_rep')
    is_active = models.BooleanField(default=True)
    
    # Profile
    department = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    avatar_url = models.URLField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('user', 'company')
        ordering = ['user__first_name', 'user__last_name']
        indexes = [
            models.Index(fields=['company', 'is_active']),
            models.Index(fields=['role']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.company.name}"
