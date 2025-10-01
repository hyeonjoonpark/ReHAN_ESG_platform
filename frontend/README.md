## Deploy with Docker

First, run the development server:

```bash
docker build -t rehan-frontend .
docker run -p 3000:3000 rehan-frontend
```

```bash
docker compose -f docker-compose.yaml -f docker-compose.hardware.yaml down && docker compose -f docker-compose.yaml -f docker-compose.hardware.yaml build --no-cache && docker compose -f docker-compose.yaml -f docker-compose.hardware.yaml up -d
```

```bash
docker compose -f docker-compose.yaml -f docker-compose.hardware.yaml up -d --no-build
```