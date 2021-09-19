FROM node:16.9.1-alpine3.12

RUN npm install -g http-server

WORKDIR /app/frontend

COPY . .

RUN npm install

EXPOSE 8080

RUN npm run build

CMD ["http-server", "dist"]