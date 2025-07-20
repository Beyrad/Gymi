from django.shortcuts import render

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.generics import get_object_or_404

from .models import Workout
from .serializers import WorkoutSerializer

class CreateUpdateWorkout(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request, id=None):
        if id:
            workout = get_object_or_404(Workout, id=id)
            if workout.user != request.user:
                return Response({"message": "You don't have access to this workout"}, status=status.HTTP_403_FORBIDDEN)
            serializer = WorkoutSerializer(instance=workout, data=request.data)
            if serializer.is_valid():
                workout = serializer.save()
                return Response({"message": "workout changed successfully", "workout": serializer.data})
            else:
                return Response({"message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        else:
            serializer = WorkoutSerializer(data=request.data, context={
                'user': request.user
            })

            if serializer.is_valid():
                workout = serializer.save()
                return Response({"message" : "workout created successfully", "workout": serializer.data}, status=status.HTTP_201_CREATED)
            else:
                return Response({"message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
            
    def get(self, request):
        workouts = Workout.objects.filter(user=request.user)
        serializer = WorkoutSerializer(workouts, many=True)
        return Response({"Workouts": serializer.data})
    
class HowToDo(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, id, *args, **kwargs):
        workout = get_object_or_404(Workout, id=id)
        if workout.user != request.user:
            return Response({"message": "You don't have access to this workout"}, status=status.HTTP_403_FORBIDDEN)
        
        res = workout.AskHowToDo()
        return res


