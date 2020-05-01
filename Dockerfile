FROM node:12
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 9090
EXPOSE 2011

# Run the app
CMD [ "npm", "start" ]
