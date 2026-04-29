from django.db import models


class TenantAwareQuerySet(models.QuerySet):
    """Custom queryset that filters by tenant"""
    
    def for_tenant(self, tenant_id):
        """Filter by tenant"""
        return self.filter(company_id=tenant_id)


class TenantAwareManager(models.Manager):
    """Custom manager for tenant-aware models"""
    
    def get_queryset(self):
        return TenantAwareQuerySet(self.model, using=self._db)
    
    def for_tenant(self, tenant_id):
        """Filter by tenant"""
        return self.get_queryset().for_tenant(tenant_id)


class TenantAwareModel(models.Model):
    """Base model for all tenant-aware data"""
    
    company = models.ForeignKey(
        'crm.Company',
        on_delete=models.CASCADE,
        help_text='Company/Tenant this record belongs to'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = TenantAwareManager()
    
    class Meta:
        abstract = True
    
    def save(self, *args, **kwargs):
        """Override save to ensure company_id is always set"""
        if not self.company_id:
            raise ValueError("company_id must be set before saving")
        super().save(*args, **kwargs)
