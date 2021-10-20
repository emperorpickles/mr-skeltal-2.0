FROM node:16-alpine
WORKDIR /app

RUN apk add --no-cache ffmpeg alpine-sdk automake libtool autoconf python3

COPY package*.json ./
RUN npm install

COPY . .
CMD [ "node", "index.js" ]