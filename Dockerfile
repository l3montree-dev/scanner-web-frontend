FROM node:20.13.1-bookworm@sha256:45da3826d21df329eacade6725afa328442710e094454407151c42fef1341b0c as builder

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

# checkov:skip=CKV_DOCKER_3
FROM gcr.io/distroless/nodejs20-debian12@sha256:36b2247bda45163fff0cfef127806d8c7661648ceb27b1c255eb987df3388551

# checkov:skip=CKV_DOCKER_2
WORKDIR /usr/app/
ENV PORT 3000

# Copy libs for prisma
COPY --from=builder /lib/x86_64-linux-gnu /lib/x86_64-linux-gnu
COPY --from=builder /usr/app /usr/app

CMD [ "./node_modules/next/dist/bin/next", "start" ]
