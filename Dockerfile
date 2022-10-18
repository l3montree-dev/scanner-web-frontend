FROM ozgsecurity/ozgsec-security-quick-test:base-image-v0.0.1@sha256:f37e4042c447d3723bfd8c5bed34da930cd3eb78039f391fafb2a0ff888bfbe1
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