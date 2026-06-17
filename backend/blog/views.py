from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Author, Comment, Post
from .serializers import CommentSerializer, PostSerializer, SignupSerializer


def get_or_create_author_for_user(user):
    # Create the Author profile lazily so authenticated users can post immediately.
    author, _ = Author.objects.get_or_create(
        user=user,
        defaults={
            "name": user.get_full_name() or user.username,
            "email": user.email or f"{user.username}@example.com",
        },
    )
    return author


class HealthView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"status": "ok"})


class ReadinessView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"status": "ready"})


class SignupView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = SignupSerializer


class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.select_related("author").prefetch_related("comments").all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=get_or_create_author_for_user(self.request.user))


class PostCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_post(self):
        return get_object_or_404(Post, pk=self.kwargs["post_id"])

    def get_queryset(self):
        return (
            Comment.objects.select_related("author", "post")
            .filter(post=self.get_post())
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        serializer.save(
            post=self.get_post(),
            author=get_or_create_author_for_user(self.request.user),
        )
