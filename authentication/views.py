from django.shortcuts import render

from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView

from .models import User
from .serializers import UserSerializer

class UsernameList(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class Register(APIView):
    def post()
