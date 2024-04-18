FROM node:20-alpine

WORKDIR /src
COPY app/package*.json /
EXPOSE 80
ENV PORT=80

RUN npm install -g nodemon && npm install
COPY app .
RUN npm ci

CMD ["npm", "start"]
