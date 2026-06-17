# Django Blog

Task implementation for a Django REST blog with JWT auth, React frontend, Docker, Kubernetes manifests, and GitHub Actions CI/CD.

## Features

- Django REST API with `Author`, `Post`, and `Comment` models
- JWT authentication using `djangorestframework-simplejwt`
- Health and readiness endpoints
- React frontend for login, listing posts, creating posts, and adding comments
- Docker Compose with Django, PostgreSQL, and Nginx
- Kubernetes manifests for backend deployment and monitoring placeholders
- GitHub Actions CI and self-hosted CD workflow

## Backend Endpoints

- `POST /api/token/` -> issue access and refresh token
- `POST /api/token/refresh/` -> refresh access token
- `GET /api/posts/` -> list posts
- `POST /api/posts/` -> create a post, JWT required
- `GET /api/posts/<id>/comments/` -> list comments of a post
- `POST /api/posts/<id>/comments/` -> create comment, JWT required
- `GET /api/health/` -> `{ "status": "ok" }`
- `GET /api/readiness/` -> `{ "status": "ready" }`

## Local Run Steps

### Backend without Docker

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements/local.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_BASE_URL=http://localhost/api/` if you want to target the Nginx reverse proxy.

### Docker Compose

```bash
cd docker
docker compose up --build
```

Local reverse proxy URL: `http://localhost/`

## Deployment Steps

1. Build and push the Docker image to DockerHub.
2. Replace `your-dockerhub-username` in `k8s/deployment.yaml` with your DockerHub username.
3. Update `k8s/configmap.yaml` and `k8s/secret.yaml` with real values.
4. Install Nginx Ingress Controller on your AWS Kubernetes cluster.
5. Apply manifests:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/
```

6. Configure the GitHub self-hosted runner with `kubectl` access and set secrets:
   `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `KUBE_CONFIG`

## Submission Placeholders

- Netlify link: `ADD_YOUR_NETLIFY_URL`
- AWS backend IP/domain: `ADD_YOUR_AWS_BACKEND_URL`
- Grafana dashboard URL: `ADD_YOUR_GRAFANA_URL`

## Monitoring Notes

- `k8s/monitoring/` contains starter manifests for Prometheus, Grafana, and Loki.
- For real Grafana + Loki log exploration, install the full Helm charts or operators and configure Promtail/Alloy to ship Django container logs.
