from rest_framework import serializers
from .models import Workout

class WorkoutSerializer(serializers.ModelSerializer):
    name_english = serializers.CharField(max_length=30, required=False)

    class Meta:
        model = Workout
        fields = ['id', 'name_english', 'name_persian', 'score', 'user_tips', 'sets', 'last_weight']
        read_only_fields = ['id', 'user']

    def validate(self, data):
        if not self.instance and 'name_english' not in data:
            raise serializers.ValidationError("For Creating a workout you need to provide at least english name")
        
        return data


    def create(self, validated_data):
        user = self._context['user']
        if not user:
            return serializers.ValidationError("You should specify user when creating an instance of workout model")
        validated_data['user'] = user
        return super().create(validated_data)
    
