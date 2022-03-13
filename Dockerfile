FROM node:alpine as Builder
MAINTAINER @AndreySHSH <laptev.andrey@icloud.com>

WORKDIR /app

COPY src ./src
COPY babel.config.js ./
COPY package.json ./
COPY yarn.lock ./
COPY webpack.server.js ./
COPY public ./public
COPY server ./server
COPY deploy/.env ./

RUN NODE_OPTIONS=--openssl-legacy-provider yarn install
RUN NODE_OPTIONS=--openssl-legacy-provider yarn build
RUN NODE_OPTIONS=--openssl-legacy-provider yarn dev:build-server

FROM node:alpine

WORKDIR /app
COPY --from=Builder /app ./

EXPOSE 80

CMD ["yarn", "dev:start"]