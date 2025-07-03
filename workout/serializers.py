from rest_framework import serializers

class WorkoutSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ['name_english', 'name_persian', 'score', 'user_tips', 'sets']
        read_only_fields = ['id', 'user']

    
