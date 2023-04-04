FROM node:18.15.0@sha256:33f306d574d22a441f6473d09c851763ff0d44459af682a2ff23b6ec8a06b03e as builder
LABEL maintainer="ozgsec@neuland-homeland.de"

WORKDIR /usr/app/
ENV PORT 3000
EXPOSE 3000

ARG NEXT_PUBLIC_ENVIRONMENT
ENV NEXT_PUBLIC_ENVIRONMENT=$NEXT_PUBLIC_ENVIRONMENT

ARG SENTRY_RELEASE
ENV SENTRY_RELEASE=$SENTRY_RELEASE

ARG NEXT_PUBLIC_SENTRY_DSN
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN

ARG SENTRY_RELEASE
ENV SENTRY_RELEASE=$SENTRY_RELEASE

COPY package.json .
COPY ./prisma prisma
RUN npm i

COPY . .

ENV NODE_ENV production
RUN npm run build

FROM gcr.io/distroless/nodejs18-debian11@sha256:c6163adfda796463a5691fc9f29733320ca2846985ba3708e0d490fbcbdc66f8

WORKDIR /usr/app/
ENV PORT 3000

# Copy libs for prisma
COPY --from=builder /lib/x86_64-linux-gnu /lib/x86_64-linux-gnu
COPY --from=builder /usr/app /usr/app

CMD [ "./node_modules/next/dist/bin/next", "start" ]
