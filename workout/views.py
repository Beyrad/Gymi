from django.shortcuts import render

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.generics import get_object_or_404

from .models import Workout

class CreateUpdateWorkout(APIView):
    def put(self, request, id=None):
        if id:
            workout = get_object_or_404(Workout, id=id)
            serializer = WorkoutSerializer(instance=workout, data=request.data)
            
