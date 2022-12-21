FROM node:18
LABEL maintainer="bastin.tim@gmail.com"

WORKDIR /usr/app/
ENV PORT 3000
EXPOSE 3000

COPY package.json .
RUN npm install

COPY . .

ENV NODE_ENV production
RUN npm run build

CMD [ "npm", "start" ]