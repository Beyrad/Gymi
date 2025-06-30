from django.shortcuts import render

from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView

from .models import User
from .serializers import UserSerializer

class UsernameList(APIView):
    def get(self, request, *args, **kwargs):
        return Response(User.objects.values_list('username', flat=True))
