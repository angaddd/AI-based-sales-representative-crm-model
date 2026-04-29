from django.utils.deprecation import MiddlewareMixin


class TenantMiddleware(MiddlewareMixin):
    """
    Middleware to extract and store tenant information.
    Ensures all requests have tenant context.
    """
    
    def process_request(self, request):
        """Extract tenant_id from request headers or JWT"""
        # Try to get from header first
        tenant_id = request.META.get('HTTP_X_TENANT_ID')
        
        # If not in header, try to extract from JWT
        if not tenant_id and request.META.get('HTTP_AUTHORIZATION'):
            try:
                import jwt
                from django.conf import settings
                token = request.META.get('HTTP_AUTHORIZATION', '').split(' ')[1]
                payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
                tenant_id = payload.get('company_id')
            except:
                pass
        
        request.tenant_id = tenant_id
        return None
