FROM node:24.17.0-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm ci --omit=dev

FROM node:24.17.0-alpine

WORKDIR /app

RUN rm -rf /usr/local/lib/node_modules/npm \
    && rm -f /usr/local/bin/npm \
    && rm -f /usr/local/bin/npx

COPY --from=builder /app/node_modules ./node_modules

COPY . .

RUN chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "app.js"]
