from openai import OpenAI
from decouple import config

client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=config('API_KEY'),
)

completion = client.chat.completions.create(
  extra_headers={
  },
  extra_body={},
  model="deepseek/deepseek-r1:free",
  messages=[
    {
      "role": "user",
      "content": "Hello can you hear me?"
    }
  ]
)
print(completion.choices[0].message.content)
