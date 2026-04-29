import jwt
import json
from datetime import datetime, timedelta
from functools import wraps
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import User


class JWTAuthentication(BaseAuthentication):
    """Custom JWT Authentication"""
    
    def authenticate(self, request):
        """
        Extract JWT from Authorization header
        """
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            return None
        
        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            
            # Get or create user
            try:
                user = User.objects.get(id=payload['user_id'])
            except User.DoesNotExist:
                raise AuthenticationFailed('User not found')
            
            # Store tenant_id in request
            request.tenant_id = payload.get('tenant_id')
            request.user_company_id = payload.get('company_id')
            
            return (user, token)
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')
    
    @staticmethod
    def generate_token(user, company_id):
        """Generate JWT token for user"""
        payload = {
            'user_id': user.id,
            'company_id': company_id,
            'tenant_id': company_id,
            'exp': datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRATION_HOURS),
            'iat': datetime.utcnow(),
        }
        token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
        return token
