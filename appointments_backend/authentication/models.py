from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, name, date_of_birth, password=None):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)

        user = self.model(
            email=email,
            username=username,
            name=name,
            date_of_birth=date_of_birth,
            password=password
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, name, date_of_birth, password=None):
        user = self.create_user(username, email, name, date_of_birth, password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    date_of_birth = models.DateField()
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'

    REQUIRED_FIELDS = ['username', 'name', 'date_of_birth']

    def __str__(self):
        return self.email
