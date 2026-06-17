from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Author, Post

User = get_user_model()


class BlogApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="tester",
            password="strong-pass-123",
            email="tester@example.com",
        )

    def authenticate(self):
        token_response = self.client.post(
            reverse("token_obtain_pair"),
            {"username": "tester", "password": "strong-pass-123"},
            format="json",
        )
        self.assertEqual(token_response.status_code, status.HTTP_200_OK)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {token_response.data['access']}"
        )

    def test_health_endpoint(self):
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"status": "ok"})

    def test_signup_creates_user_and_author_profile(self):
        response = self.client.post(
            "/api/signup/",
            {
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "strong-pass-123",
                "confirm_password": "strong-pass-123",
                "first_name": "New",
                "last_name": "User",
                "bio": "Blog writer",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="newuser").exists())
        self.assertTrue(Author.objects.filter(user__username="newuser").exists())

    def test_can_create_post_when_authenticated(self):
        self.authenticate()
        response = self.client.post(
            "/api/posts/",
            {"title": "First Post", "content": "Hello world", "is_published": True},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Post.objects.count(), 1)

    def test_post_comments_endpoint_requires_auth_for_create(self):
        self.authenticate()
        post_response = self.client.post(
            "/api/posts/",
            {"title": "First Post", "content": "Hello world", "is_published": True},
            format="json",
        )
        post_id = post_response.data["id"]
        self.client.credentials()

        unauthenticated = self.client.post(
            f"/api/posts/{post_id}/comments/",
            {"body": "Needs auth"},
            format="json",
        )
        self.assertEqual(unauthenticated.status_code, status.HTTP_401_UNAUTHORIZED)

        self.authenticate()
        authenticated = self.client.post(
            f"/api/posts/{post_id}/comments/",
            {"body": "Looks good"},
            format="json",
        )
        self.assertEqual(authenticated.status_code, status.HTTP_201_CREATED)
