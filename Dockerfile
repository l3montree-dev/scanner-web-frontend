FROM node:18
LABEL maintainer="bastin.tim@gmail.com"

WORKDIR /usr/app/
ENV PORT 3000

ARG NEXT_PUBLIC_ENVIRONMENT
ENV NEXT_PUBLIC_ENVIRONMENT=$NEXT_PUBLIC_ENVIRONMENT

EXPOSE 3000

COPY package.json .
COPY ./prisma prisma
RUN npm i

COPY . .

ENV NODE_ENV production
RUN npm run build

RUN npm prune --production

CMD [ "npm", "start" ]