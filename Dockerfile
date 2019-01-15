FROM node:8-alpine

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY . .
EXPOSE 80
CMD ls fixtures \
    && npm start