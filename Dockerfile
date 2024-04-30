FROM node:20.12.2-bookworm@sha256:cbd62dc7ba7e50d01520f2c0a8d9853ec872187fa806ed61d0f87081c220386d as builder
LABEL maintainer="ozgsec@neuland-homeland.de"

WORKDIR /usr/app/
ENV PORT 3000
EXPOSE 3000

ARG NEXT_PUBLIC_ENVIRONMENT
ENV NEXT_PUBLIC_ENVIRONMENT=$NEXT_PUBLIC_ENVIRONMENT

COPY package.json .
COPY package-lock.json .
COPY ./prisma prisma
RUN npm ci

COPY . .

ENV NODE_ENV production
RUN npm run build

FROM gcr.io/distroless/nodejs20-debian12

WORKDIR /usr/app/
ENV PORT 3000

# Copy libs for prisma
COPY --from=builder /lib/x86_64-linux-gnu /lib/x86_64-linux-gnu
COPY --from=builder /usr/app /usr/app

CMD [ "./node_modules/next/dist/bin/next", "start" ]
