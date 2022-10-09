FROM ubuntu:22.04

RUN apt-get update && apt-get -y install curl wget build-essential libgd-dev libgeoip-dev checkinstall git

COPY build_nginx.sh . 
RUN ./build_nginx.sh

RUN mkdir -p /var/lib/nginx/body && mkdir -p /root/ssl && mkdir html

EXPOSE 80
EXPOSE 443

CMD ["/usr/sbin/nginx", "-g", "daemon off;"]