from django.urls import path
from knox import views as knox_views
from . import views


urlpatterns = [
    path("login/", views.LoginAPIView.as_view()),
    path("user/", views.GetUserDataAPIView.as_view()),
    path("registration/", views.RegisterAPIView.as_view()),
    path("logout/", knox_views.LogoutView.as_view()),
]
