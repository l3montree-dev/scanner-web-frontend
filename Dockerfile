FROM node:20.12.2-buster@sha256:57fe11caf946b3bdcbe370a444ab1d7102123421e62157f62516b2abd4d9b7ae as builder
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
