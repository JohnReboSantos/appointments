from django.contrib import admin
from .models import ClinicSchedule, Procedure, Appointment


class ClinicScheduleAdmin(admin.ModelAdmin):
    list_display = ('day', 'start_time', 'end_time')
    list_editable = ('start_time', 'end_time')

admin.site.register(ClinicSchedule, ClinicScheduleAdmin)


class ProcedureAdmin(admin.ModelAdmin):
    list_display = ('name',)
    list_editable = ('name',)
    list_display_links = None

admin.site.register(Procedure, ProcedureAdmin)


class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient_name', 'schedule', 'procedure', 'status')

admin.site.register(Appointment, AppointmentAdmin)
