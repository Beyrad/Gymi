from django.db import models
from authentication.models import User

CHOICES = [(i, i) for i in range(1, 6)]

class Workout(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name_english = models.CharField(max_length=30)
    name_persian = models.CharField(max_length=30, blank=True)
    score = models.SmallIntegerField(choices=CHOICES, blank=True, null=True)
    user_tips = models.TextField(blank=True)
    sets = models.JSONField(default=list, blank=True, null=True)
    


