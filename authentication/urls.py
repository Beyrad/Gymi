from django.urls import path

from .views import UsernameList

urlpatterns = [
    path('', UsernameList.as_view()),
]
