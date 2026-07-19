FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json nest-cli.json tsconfig.json tsconfig.build.json ./
COPY apps/api-gateway/ ./apps/api-gateway/
COPY apps/portfolio-service/ ./apps/portfolio-service/
COPY libs/common/ ./libs/common/
COPY libs/database/ ./libs/database/

RUN npm ci --only=production

FROM base AS development
RUN npm install
EXPOSE 3000 3001

FROM base AS production
RUN npm ci && npm run build
EXPOSE 3000 3001
CMD ["node", "dist/apps/api-gateway/main"]
