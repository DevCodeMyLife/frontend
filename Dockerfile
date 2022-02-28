FROM node:alpine

MAINTAINER @AndreySHSH <laptev.andrey@icloud.com>
#
#COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
#COPY build /usr/share/nginx/html

COPY . ./app

WORKDIR ./app

RUN NODE_OPTIONS=--openssl-legacy-provider yarn run build
RUN yarn dev:build-server

EXPOSE 80

CMD ["yarn", "dev:start"]