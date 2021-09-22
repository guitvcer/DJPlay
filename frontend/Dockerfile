FROM node:16.9.1-alpine3.12

WORKDIR /app/frontend

COPY . .

RUN npm install -g npm@7.24.0
RUN npm install

EXPOSE 8080

CMD ["npm", "run", "serve"]