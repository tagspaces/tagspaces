FROM nginx:1.22.1-alpine
MAINTAINER tagspaces.org

ADD https://github.com/tagspaces/tagspaces/releases/download/v5.0.6/tagspaces-web-5.0.6.zip .
RUN rm -rf /usr/share/nginx/html
RUN unzip tagspaces-web-5.0.6.zip
RUN mv web /usr/share/nginx/html
# cleanup
RUN rm -rf tagspaces-web-5.0.6.zip

EXPOSE 80
