from django.urls import path

from .views import (
    HealthView,
    PostCommentListCreateView,
    PostListCreateView,
    ReadinessView,
    SignupView,
)

urlpatterns = [
    path("posts/", PostListCreateView.as_view(), name="post-list-create"),
    path("signup/", SignupView.as_view(), name="signup"),
    path(
        "posts/<int:post_id>/comments/",
        PostCommentListCreateView.as_view(),
        name="post-comments",
    ),
    path("health/", HealthView.as_view(), name="health"),
    path("readiness/", ReadinessView.as_view(), name="readiness"),
]
