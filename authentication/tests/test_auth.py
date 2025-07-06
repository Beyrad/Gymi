from django.test import TestCase

from authentication.models import User

class AuthenticationTests(TestCase):
    username = 'test'
    password = '123'
    phone = '09000000000'

    def setUp(self):
        User.objects.create_user(username=self.username, password=self.password, phone=self.phone)

        
    def test_register(self):
        client = self.client
        res = client.post('/authentication/register/', data={
            'username': 'client1',
            'password': '123',
            'phone': '09000000000'
        })

        self.assertEqual(res.status_code, 201)

    def test_phone_valid(self):
        res = self.client.post('/authentication/register/', data={
            'username': 'client2',
            'password': '123',
            'phone': '090000000'
        })
        self.assertEqual(res.status_code, 400)

    def test_phone_bad_format(self):
        res = self.client.post('/authentication/register/', data={
            'username': 'client2',
            'password': '123',
            'phone': '90000000000'
        })
        self.assertEqual(res.status_code, 400)
        errors = {'phone': ['Phone Number should match this format: 09 following 9 digits']}
        self.assertEqual(res.json().get("errors"), errors)

    def test_phone_not_provided(self):
        res = self.client.post('/authentication/register/', data={
            'username': 'client2',
            'password': '123'
        })
        self.assertEqual(res.status_code, 400)
        errors = {'phone': ['This field is required.']}
        self.assertEqual(res.json().get("errors"), errors)


    def test_login_valid(self):
        res = self.client.post('/authentication/login/', data={
            'username': self.username,
            'password': self.password
        })

        self.assertEqual(res.status_code, 200)
        self.assertTrue('_auth_user_id' in self.client.session)
        self.assertEqual(res.json().get("message"), f"user with username='{self.username}' logged in successfully!")

    def test_login_bad_password(self):
        res = self.client.post('/authentication/login/', data={
            'username': self.username,
            'password': self.password + "324"
        })

        self.assertEqual(res.status_code, 401)
        self.assertTrue('_auth_user_id' not in self.client.session)
        self.assertEqual(res.json(), {"message": "invalid credentials"})

    def test_login_bad_username(self):
        res = self.client.post('/authentication/login/', data={
            'username': "random_username_which_is_not_real",
            'password': self.password
        })

        self.assertEqual(res.status_code, 401)
        self.assertTrue('_auth_user_id' not in self.client.session)
        self.assertEqual(res.json(), {"message": "invalid credentials"})

    def test_logout(self):
        







    
        
    