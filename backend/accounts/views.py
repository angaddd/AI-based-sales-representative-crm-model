from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
from django.db.models import Q

from accounts.models import Company, CompanyUser
from accounts.serializers import (
    CompanySerializer, CompanyUserSerializer, RegisterSerializer,
    LoginSerializer, ChangePasswordSerializer
)
from core.auth import JWTAuthentication


class AuthViewSet(viewsets.ViewSet):
    """Authentication endpoints"""
    
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        """Register new company and user"""
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save()
            user = Company.objects.get(id=result['company_id']).users.first().user
            token = JWTAuthentication.generate_token(user, result['company_id'])
            
            return Response({
                'success': True,
                'token': token,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                },
                'company': {
                    'id': result['company_id'],
                    'name': result['company_name']
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """Login user"""
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Get company user
            company_user = CompanyUser.objects.get(user=user)
            company = company_user.company
            
            # Update last login
            company_user.last_login = timezone.now()
            company_user.save(update_fields=['last_login'])
            
            # Generate token
            token = JWTAuthentication.generate_token(user, company.id)
            
            return Response({
                'token': token,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': company_user.role,
                },
                'company': CompanySerializer(company).data,
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        """Change user password"""
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'error': 'Old password is incorrect'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response({'message': 'Password changed successfully'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current user info"""
        company_user = CompanyUser.objects.get(user=request.user)
        
        return Response({
            'user': {
                'id': request.user.id,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
                'role': company_user.role,
            },
            'company': CompanySerializer(company_user.company).data,
        })


class CompanyViewSet(viewsets.ModelViewSet):
    """Manage companies"""
    
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return only user's company"""
        try:
            company_user = CompanyUser.objects.get(user=self.request.user)
            return Company.objects.filter(id=company_user.company_id)
        except CompanyUser.DoesNotExist:
            return Company.objects.none()


class CompanyUserViewSet(viewsets.ModelViewSet):
    """Manage company users"""
    
    serializer_class = CompanyUserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return only users in user's company"""
        try:
            company_user = CompanyUser.objects.get(user=self.request.user)
            return CompanyUser.objects.filter(company=company_user.company)
        except CompanyUser.DoesNotExist:
            return CompanyUser.objects.none()
    
    @action(detail=False, methods=['post'])
    def invite_user(self, request):
        """Invite new user to company"""
        try:
            company_user = CompanyUser.objects.get(user=request.user)
        except CompanyUser.DoesNotExist:
            return Response({'error': 'User not in any company'}, status=status.HTTP_404_NOT_FOUND)
        
        email = request.data.get('email')
        role = request.data.get('role', 'sales_rep')
        
        if not email:
            return Response({'error': 'Email required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already exists in company
        if CompanyUser.objects.filter(user__email=email, company=company_user.company).exists():
            return Response({'error': 'User already in company'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create new user (password will be sent via email)
        from django.contrib.auth.models import User
        user, created = User.objects.get_or_create(
            email=email,
            defaults={'username': email, 'first_name': email.split('@')[0]}
        )
        
        # Create company user
        company_user_obj = CompanyUser.objects.create(
            user=user,
            company=company_user.company,
            role=role
        )
        
        return Response(
            CompanyUserSerializer(company_user_obj).data,
            status=status.HTTP_201_CREATED
        )
