from django.urls import path

from .views import UsernameList, Register

urlpatterns = [
    path('register/', Register.as_view()),
    path('', UsernameList.as_view()),
]
