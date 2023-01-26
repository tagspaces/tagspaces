FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

COPY . /usr/src/app/

RUN npm install

# Run the app
CMD ["npm", "run", "create-bucket"]
