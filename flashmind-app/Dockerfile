FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json tsconfig*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2) Production image
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/package*.json ./
RUN npm ci --production
COPY --from=build /app/dist ./dist
# copy any .env.sample or defaults if you want
EXPOSE 3001
CMD ["node", "dist/server.js"]