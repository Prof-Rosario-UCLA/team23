# 1) Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2) Serve static assets
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# copy a custom nginx.conf if you need SPA fallback
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]