"""
Serializers for user api view
"""

from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
from django.utils.translation import gettext as _


class UserSerializer(serializers.ModelSerializer):
    """Serializer for the user object"""

    class Meta:
        model = get_user_model()
        fields = ['id', 'email', 'password', 'name', 'phone_number', 'is_staff']
        extra_kwargs = {
            'password': {'write_only': True, 'min_length': 5, 'required': False},
            'email': {'required': False}
        }

    def create(self, validated_data):
        """Create and return a user with encrypted password"""
        return get_user_model().objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        """Update and return user with encrypted password"""
        password = validated_data.pop('password', None)
        email = validated_data.pop('email', None)
        user = self.context['request'].user
        user.name = validated_data.get('name', user.name)
        print(user.name)
        user.phone_number = validated_data.get('phone_number', user.phone_number)
        if email:
            user.email = email
        if password:
            user.set_password(password)
        user.save()
        return user


class AuthTokenSerializer(serializers.Serializer):
    """Serializer for user auth token"""
    email = serializers.EmailField()
    password = serializers.CharField(
        style={'input_type': 'password'},
        trim_whitespace=False
    )

    def validate(self, attrs):
        """Validate and authenticate user"""
        email = attrs.get('email')
        password = attrs.get('password')
        user = authenticate(
            request=self.context.get('request'),
            username=email,
            password=password
        )
        if not user:
            msg = _('Invalid Credentials')
            raise serializers.ValidationError(msg, code='authorization')

        attrs['user'] = user

        return attrs
