from django.shortcuts import render

from django.contrib.auth import login, logout, authenticate

from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView

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
            return Response(f"User with {user.username=} and {user.phone=} has been created successfully!", status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

class Login(APIView):
    def post(self, request, *args, **kwargs):
        username = request.data['username']
        password = request.data['password']

        user = authenticate(request, username=username, password=password)
        if user:
            login(user, request)
            return Response(f"user with {username=} logged in successfully!")
        else:
            return Response("invalid credentials", status=status.HTTP_403_FORBIDDEN)

