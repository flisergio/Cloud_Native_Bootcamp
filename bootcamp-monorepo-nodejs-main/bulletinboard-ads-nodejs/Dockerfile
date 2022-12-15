FROM node:16-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY index.js ./
COPY lib ./lib/
COPY migrations ./migrations/
COPY public ./public/

EXPOSE 8080

CMD [ "npm", "start" ]
