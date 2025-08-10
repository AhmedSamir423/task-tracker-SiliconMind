FROM node:18-alpine


RUN apk add --no-cache dumb-init

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY backend/ ./

COPY database/ ./database/

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs


RUN chown -R nodejs:nodejs /app


USER nodejs

EXPOSE 3000


HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "server.js"]