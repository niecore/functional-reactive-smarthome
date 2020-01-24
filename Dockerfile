FROM node:12
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Run the app
CMD [ "npm", "start" ]