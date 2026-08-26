FROM nginx:latest

RUN rm -rf /usr/share/nginx/html/*
RUN rm /etc/nginx/nginx.conf

COPY nginx.conf /etc/nginx/

COPY src/ /usr/share/nginx/html/

EXPOSE 80