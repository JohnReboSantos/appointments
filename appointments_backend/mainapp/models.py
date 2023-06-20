from django.db import models
from authentication.models import CustomUser


class Dentist(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)


class ClinicSchedule(models.Model):
    DAY_CHOICES = (
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    )
    day = models.CharField(max_length=10, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.get_day_display()} ({self.start_time} - {self.end_time})"


class Procedure(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Appointment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    patient_name = models.CharField(max_length=255)
    email = models.EmailField()
    procedure = models.ForeignKey(Procedure, on_delete=models.CASCADE)
    schedule = models.DateTimeField(null=False, blank=False)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
