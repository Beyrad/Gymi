from rest_framework import serializers

class WorkoutSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ['name_english', 'name_persian', 'score', 'user_tips', 'sets']
        read_only_fields = ['id', 'user']


    def create(self, validated_data):
        user = self._context['user']
        if not user:
            return serializers.ValidationError("You should specify user when creating an instance of workout model")
        validated_data['user'] = user
        return super().create(validated_data)
    
