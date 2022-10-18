FROM node:18@sha256:9d8a6466c6385e05f62f8ccf173e80209efb0ff4438f321f09ddf552b05af3ba
LABEL maintainer="bastin.tim@gmail.com"

WORKDIR /usr/app/
ENV PORT 3000
EXPOSE 3000

COPY build_openssl.sh .
RUN ./build_openssl.sh