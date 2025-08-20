# Build stage
FROM node:18-alpine as builder

WORKDIR /app


COPY frontend/package*.json ./


RUN npm ci


COPY frontend/ ./


ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL


RUN npm run build

FROM nginx:alpine


RUN apk add --no-cache gettext


COPY frontend/nginx.conf /etc/nginx/nginx.conf


COPY --from=builder /app/dist /usr/share/nginx/html


COPY frontend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh


COPY frontend/env.template.js /usr/share/nginx/html/env.template.js


EXPOSE 80


HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1


ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]