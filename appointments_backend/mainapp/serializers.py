from rest_framework import serializers
from datetime import timedelta
from .models import Dentist, Procedure, Appointment, ClinicSchedule


class DentistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dentist
        fields = "user"


class ProcedureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Procedure
        fields = ("id", "name")


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = (
            "id",
            "patient_name",
            "email",
            "procedure",
            "schedule",
            "status",
            "created_at",
        )


class ClinicScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClinicSchedule
        fields = ("day", "start_time", "end_time")
