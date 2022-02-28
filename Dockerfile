FROM node:alpine

MAINTAINER @AndreySHSH <laptev.andrey@icloud.com>
#
#COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
#COPY build /usr/share/nginx/html

COPY . ./app

WORKDIR ./app

RUN yarn install
RUN yarn run build

EXPOSE 8000

CMD ["yarn", "dev:start"]