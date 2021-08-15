FROM nginx:stable-alpine
COPY nginx_app/nginx.conf /etc/nginx/conf.d/default.conf
COPY build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]