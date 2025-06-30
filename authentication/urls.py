from django.urls import path

from .views import UsernameList, Register, Login

urlpatterns = [
    path('register/', Register.as_view()),
    path('login/', Login.as_view()),
    path('', UsernameList.as_view()),
]
