# ---- Build stage ----
FROM node:20-alpine AS builder

# VITE_POCKETBASE_URL is baked in at build time by Vite.
# Pass it as a build arg when deploying:
#   docker build --build-arg VITE_POCKETBASE_URL=https://your-backend-url .
ARG VITE_POCKETBASE_URL
ENV VITE_POCKETBASE_URL=$VITE_POCKETBASE_URL

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Serve stage ----
FROM nginx:stable-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

# Use a template so nginx listens on Cloud Run's $PORT at runtime.
# nginx automatically processes /etc/nginx/templates/*.template via envsubst.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Cloud Run injects PORT; default to 8080 if running locally.
ENV PORT=8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
