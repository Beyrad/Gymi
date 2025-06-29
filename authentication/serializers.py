from rest_framework import serializers

from .models import User

import re

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password', 'phone']

    def validate_phone(self, phone):
        if phone is None or re.match(r"^09[0-9]{9}$", phone) is None:
            raise serializers.ValidationError("Phone Number should match this format: 09 following 9 digits")
        return phone
        