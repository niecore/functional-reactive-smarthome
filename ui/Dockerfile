#########################
### build environment ###
#########################

FROM node:12-alpine as builder

WORKDIR /usr/src/app

COPY ./ui/package*.json ./ui/

RUN cd ui && npm install --only-prod

COPY ./lenses.js ./lenses.js
COPY ./model ./model
COPY ./ui ./ui
COPY ./config ./config

RUN cd ui && npm run build

##################
### production ###
##################

FROM nginx:1.17-alpine

COPY --from=builder /usr/src/app/ui/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
