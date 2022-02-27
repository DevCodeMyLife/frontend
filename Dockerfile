FROM node:alpine

MAINTAINER @AndreySHSH <laptev.andrey@icloud.com>

#COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
#COPY build /usr/share/nginx/html
COPY . ./app
WORKDIR ./app

EXPOSE 80

CMD ["node", "server.js"]