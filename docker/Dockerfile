FROM nginx:1.22.1-alpine
LABEL org.opencontainers.image.authors="contact@tagspaces.org"

# ADD https://github.com/tagspaces/tagspaces/releases/download/v5.4.2/tagspaces-web-5.4.2.zip .
# RUN mv tagspaces-web-* tagspaces-web.zip
COPY tagspaces-web.zip .
RUN unzip tagspaces-web.zip
RUN rm -rf /usr/share/nginx/html
RUN mv web /usr/share/nginx/html
# cleanup
RUN rm -rf tagspaces-web.zip

EXPOSE 80
