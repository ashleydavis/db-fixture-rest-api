FROM node:8-alpine

WORKDIR /usr/src/app
COPY package*.json ./
COPY ./client ./client
RUN cd client && npm install && npm run build

FROM node:8-alpine

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY --from=0 /usr/src/app/build ./build
EXPOSE 80
CMD npm start