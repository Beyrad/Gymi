from django.urls import path

from .views import CreateUpdateWorkout

urlpatterns = [
    path('<int:id>/', CreateUpdateWorkout.as_view()),
    path('', CreateUpdateWorkout.as_view()),
]
