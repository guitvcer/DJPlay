FROM node:16.9.1-alpine3.12

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 8080

ENV VUE_APP_RECAPTCHA_PUBLIC 6LdAUyUcAAAAANujUGnroaWZd6C5woLmMVpQdRtD
ENV VUE_APP_GOOGLE_OAUTH2_PUBLIC 568731334008-liiq5eghbc2icnc51c4mrfcdcldsstvn.apps.googleusercontent.com
ENV VUE_APP_VK_OAUTH2_PUBLIC 7938245

CMD ["npm", "run", "serve"]
