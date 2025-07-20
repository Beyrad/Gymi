from django.db import models
from authentication.models import User
from openai import OpenAI, OpenAIError
from decouple import config

CHOICES = [(i, i) for i in range(1, 6)]

client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=config('API_KEY'),
)

def Ask(prompt: str) -> str:
    try:
        completion = client.chat.completions.create(
            extra_headers={},
            extra_body={},
            model="deepseek/deepseek-r1:free",
            messages=[
                { "role": "user", "content": prompt },
                { "role": "system", "content": "consider yourself as a professional gym trainer that gives" \
                                                "instructions that help user build strong muscles with good habits and with safety through the workout" }
            ]
        )
        return completion.choices[0].message.content
    except OpenAIError as e:
        print(f"OpenAIError while using AI api : {str(e)}") #better to use logs
        return "Trainer is not responding right now! please try again later"
    except Exception as e:
        print(f"Error while using AI api : {str(e)}")
        return "There is a problem with working with trainer! try again"



class Workout(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name_english = models.CharField(max_length=30)
    name_persian = models.CharField(max_length=30, blank=True)
    score = models.SmallIntegerField(choices=CHOICES, blank=True, null=True)
    user_tips = models.TextField(blank=True)
    sets = models.JSONField(default=list, blank=True, null=True)
    how_to_do = models.TextField(blank=True)
    last_weight = models.FloatField(blank=True, null=True)

    def AskHowToDo(self):
        res = Ask(f"How to do this workout called {self.name_english} demonstrate the steps clearly and say the safety tips")
        return res
    


