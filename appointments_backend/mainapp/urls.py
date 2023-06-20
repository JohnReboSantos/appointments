from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AppointmentViewSet, ClinicScheduleViewSet, ProcedureViewSet

router = DefaultRouter()
router.register('appointments', AppointmentViewSet)
router.register('clinic_schedules', ClinicScheduleViewSet)
router.register('procedures', ProcedureViewSet)

urlpatterns = [
    path('', include(router.urls))
]
