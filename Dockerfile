FROM node:18
LABEL maintainer="bastin.tim@gmail.com"

WORKDIR /usr/app/

ENV NODE_ENV production
ENV PORT 3000

EXPOSE 3000
COPY . .

RUN npm i
CMD [ "npm", "start" ]

