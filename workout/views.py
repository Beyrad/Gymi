from django.shortcuts import render

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.generics import get_object_or_404

from .models import Workout
from .serializers import WorkoutSerializer

class CreateUpdateWorkout(APIView):
    def put(self, request, id=None):
        if id:
            workout = get_object_or_404(Workout, id=id)
            if workout.user != request.user:
                return Response({"message": "You don't have access to this workout"}, status=status.HTTP_403_FORBIDDEN)
            serializer = WorkoutSerializer(instance=workout, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "workout changed successfully", "workout": serializer.data})
            else:
                return Response({"message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        else:
            serializer = WorkoutSerializer(data=request.data, user=request.user)
            if serializer.is_valid():
                serializer.save()
                return Response({"message" : "workout created successfully", "workout": serializer.data}, status=status.HTTP_201_CREATED)
            else:
                return Response({"message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
