FROM node:22-alpine AS build
WORKDIR /app

RUN npm install -g pnpm@11.9.0

# dependencies first, so this layer is cached until the lockfile changes;
# scripts are skipped because `nuxt prepare` (postinstall) needs the sources copied below
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .
RUN pnpm exec nuxt prepare \
    && pnpm test \
    && pnpm generate

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/.output/public /usr/share/nginx/html
EXPOSE 80
