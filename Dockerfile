ARG NODE_VERSION=16.17.1-bullseye-slim

FROM node:${NODE_VERSION} as builder

WORKDIR /usr/src/tagspaces

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        ca-certificates \
#        curl \
        git \
        ssh \
#        wget \
    && apt-get clean \
    && mkdir -p /root/ssh \
    && ssh-keyscan -H github.com > /root/ssh/known_hosts

COPY . /usr/src/tagspaces/
RUN npm install
RUN npm run prepare-web-pro
RUN npm run build-web

################################################################################

FROM nginx:1.22.1-alpine
MAINTAINER tagspaces.org

# ADD https://github.com/tagspaces/tagspaces/releases/download/v5.0.6/tagspaces-web-5.0.6.zip .
RUN rm -rf /usr/share/nginx/html
COPY --from=builder /usr/src/tagspaces/web /usr/share/nginx/html/
# RUN unzip tagspaces-web-5.0.6.zip
# RUN mv web /usr/share/nginx/html
# cleanup
# RUN rm -rf tagspaces-web-5.0.6.zip

EXPOSE 80
