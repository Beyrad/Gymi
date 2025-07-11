from django.test import TestCase

from authentication.models import User

from decouple import config

class AuthenticationTests(TestCase):
    username = 'test'
    password = '123'
    phone = '09000000000'

    def setUp(self):
        User.objects.create_user(username=self.username, password=self.password, phone=self.phone)
        User.objects.create_superuser(username="admin", password="verysecurepassword")


        
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

    def test_logout_anonymous(self):
        res = self.client.post('/authentication/logout/', data={})

        self.assertEqual(res.status_code, 403)
        self.assertEqual(res.json(), {"detail": "Authentication credentials were not provided."})

    def test_logout_valid(self):
        self.client.login(username=self.username, password=self.password)

        res = self.client.post('/authentication/logout/', data={})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json(), {"message": f"username='{self.username}' Logged out"})

    def test_username_list_valid(self):
        self.client.login(username='admin', password='verysecurepassword')
        
        res = self.client.get('/authentication/')
        self.assertEqual(res.status_code, 200)

        ls = res.json()
        self.assertIsInstance(ls, list)
        self.assertListEqual(ls, list(User.objects.values_list('username', flat=True)))

    def test_username_list_not_admin(self):
        self.client.login(username=self.username, password=self.password)
        
        res = self.client.get('/authentication/')
        self.assertEqual(res.status_code, 403)
        self.assertEqual(res.json(), {"detail": "You do not have permission to perform this action."})
        
    

        
    










    
        
    