from django.shortcuts import render, HttpResponse

from django.contrib.auth import login, logout, authenticate

from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import User
from .serializers import UserSerializer

class UsernameList(APIView):
    def get(self, request, *args, **kwargs):
        return Response(User.objects.values_list('username', flat=True))

class Register(APIView):
    def post(self, request, *args, **kwargs):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.set_password(user.password)
            user.save()
            return Response({"message": f"User with {user.username=} and {user.phone=} has been created successfully!"}, status=status.HTTP_201_CREATED)
        else:
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        

class Login(APIView):
    def post(self, request, *args, **kwargs):
        username = request.data['username']
        password = request.data['password']

        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return Response({"message": f"user with {username=} logged in successfully!"})
        else:
            return Response({"message": "invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        
class Logout(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        username = request.user.username
        logout(request)
        return Response({"message": f"{username=} Logged out"})
    

def test_view(request):
    x = request.user
    if not x.is_authenticated:
        return HttpResponse("No")
    else:
        return HttpResponse(x.username)

