from rest_framework import serializers
from django.contrib.auth.models import User
from accounts.models import Company, CompanyUser
import re


class CompanySerializer(serializers.ModelSerializer):
    """Serialize Company model"""
    
    user_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = ['id', 'name', 'slug', 'description', 'industry', 'email', 
                  'is_active', 'plan', 'user_count', 'created_at']
        read_only_fields = ['created_at']
    
    def get_user_count(self, obj):
        return obj.users.filter(is_active=True).count()


class CompanyUserSerializer(serializers.ModelSerializer):
    """Serialize CompanyUser model"""
    
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    
    class Meta:
        model = CompanyUser
        fields = ['id', 'user_email', 'user_first_name', 'user_last_name', 
                  'role', 'is_active', 'department', 'phone', 'created_at']
        read_only_fields = ['created_at']


class RegisterSerializer(serializers.Serializer):
    """Serializer for user registration"""
    
    company_name = serializers.CharField(max_length=255)
    company_email = serializers.EmailField()
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    password_confirm = serializers.CharField(min_length=8, write_only=True)
    
    def validate(self, data):
        # Check passwords match
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords do not match")
        
        # Check email not in use
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("Email already registered")
        
        # Validate email format
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', data['email']):
            raise serializers.ValidationError("Invalid email format")
        
        return data
    
    def create(self, validated_data):
        """Create company and user"""
        # Create company
        company_slug = validated_data['company_name'].lower().replace(' ', '-')
        company, _ = Company.objects.get_or_create(
            slug=company_slug,
            defaults={
                'name': validated_data['company_name'],
                'email': validated_data['company_email'],
                'plan': 'free'
            }
        )
        
        # Create user
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        
        # Create company user
        CompanyUser.objects.create(
            user=user,
            company=company,
            role='admin'
        )
        
        return {
            'user_id': user.id,
            'email': user.email,
            'company_id': company.id,
            'company_name': company.name
        }


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        try:
            user = User.objects.get(email=email)
            if not user.check_password(password):
                raise serializers.ValidationError("Invalid credentials")
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials")
        
        data['user'] = user
        return data


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change"""
    
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(min_length=8, write_only=True)
    new_password_confirm = serializers.CharField(min_length=8, write_only=True)
    
    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError("Passwords do not match")
        return data
