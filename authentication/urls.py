from django.urls import path

from .views import UsernameList, Register, Login, Logout, test_view

urlpatterns = [
    path('register/', Register.as_view()),
    path('login/', Login.as_view()),
    path('logout/', Logout.as_view()),
    path('test/', test_view),
    path('', UsernameList.as_view()),
]
