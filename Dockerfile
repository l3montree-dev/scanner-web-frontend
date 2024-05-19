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
FROM gcr.io/distroless/nodejs20-debian12:nonroot@sha256:94d77ed5018ae072449732067c2985d3f2f99ce0fe8b8f244cac122ca69b8e73

USER 53111

# checkov:skip=CKV_DOCKER_2
WORKDIR /usr/app/
ENV PORT 3000
ENV NODE_ENV production

# Copy libs for prisma
COPY --from=builder /lib/x86_64-linux-gnu /lib/x86_64-linux-gnu
COPY --from=builder --chown=53111:53111 /usr/app/.next /usr/app/.next
COPY --from=builder /usr/app/node_modules /usr/app/node_modules
COPY --from=builder /usr/app/package.json /usr/app/package.json
COPY --from=builder --chown=53111:53111 /usr/app/public /usr/app/public

CMD [ "./node_modules/next/dist/bin/next", "start" ]
