from django.urls import path

from .views import CreateUpdateWorkout, HowToDo

urlpatterns = [
    path('<int:id>/', CreateUpdateWorkout.as_view()),
    path('ask/<int:id>', HowToDo.as_view()),
    path('', CreateUpdateWorkout.as_view()),
]
