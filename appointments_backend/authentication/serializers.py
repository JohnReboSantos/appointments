from datetime import datetime, date
from rest_framework import serializers, permissions
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import CustomUser


class AllowUnauthenticated(permissions.BasePermission):
    def has_permission(self):
        # Allow unauthenticated requests
        return True


class RegisterSerializer(serializers.ModelSerializer):
    permission_classes = [AllowUnauthenticated, permissions.AllowAny]
    email = serializers.EmailField()
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = (
            "username",
            "name",
            "email",
            "password1",
            "password2",
            "date_of_birth",
        )

    def validate(self, data):
        name = data.get("name")
        email = data.get("email")
        password1 = data.get("password1")
        password2 = data.get("password2")
        date_of_birth = data.get("date_of_birth")

        # Validate if a user with the email already exists
        if CustomUser.objects.filter(email=email).exists():
            raise serializers.ValidationError("A user with that email already exists.")

        # Check if all fields are provided
        if not name or not email or not password1 or not password2 or not date_of_birth:
            raise serializers.ValidationError("All fields are required.")

        # Validate password match
        if password1 != password2:
            raise serializers.ValidationError("Passwords do not match.")

        # Validate password strength
        try:
            validate_password(password1)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))

        # Validate date of birth format (YYYY-MM-DD)
        try:
            birth_date = datetime.strptime(str(date_of_birth), "%Y-%m-%d").date()
        except ValueError:
            raise serializers.ValidationError(
                "Invalid date of birth format. Must be YYYY-MM-DD."
            )

        # Validate birth date is in the past
        today = date.today()
        if birth_date > today:
            raise serializers.ValidationError("Birth date must be in the past.")

        data["password"] = password1  # Save the password to the 'password' field

        return data

    def create(self, validated_data):
        username = validated_data.get("username")
        name = validated_data.get("name")
        email = validated_data.get("email")
        password = validated_data.get("password")
        date_of_birth = validated_data.get("date_of_birth")

        user = CustomUser.objects.create_user(
            username=username,
            email=email,
            password=password,
            name=name,
            date_of_birth=date_of_birth,
        )

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        user = authenticate(
            request=self.context.get("request"), email=email, password=password
        )
        if not user:
            raise serializers.ValidationError("Invalid email or password.")

        attrs["user"] = user
        return attrs
