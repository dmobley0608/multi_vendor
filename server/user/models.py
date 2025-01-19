from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin
)
class UserManager(BaseUserManager):
    """Manager for users"""

    def create_user(self, email, password=None, **extra_fields):
        """Create, save, and return user"""
        if not email:
            raise ValueError('Email address is required.')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_employee(self,email,password=None, **extra_fields):
        """Create an Employee"""
        user = self.create_user(email=email, password=password, **extra_fields)
        user.isStaff = True
        user.save()

    def create_superuser(self, email, password, **extra_fields):
        """Create, save, and return superuser"""
        user = self.create_user(email=email, password=password, **extra_fields)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    """Default User"""
    email = models.EmailField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=15, null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'