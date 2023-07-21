FROM nginx:1.24.0-alpine
LABEL org.opencontainers.image.title="TagSpaces Web"
LABEL org.opencontainers.image.description="Official build of TagSpaces for Docker."
LABEL org.opencontainers.image.url="https://www.tagspaces.org"
LABEL org.opencontainers.image.source="https://github.com/tagspaces/tagspaces"
LABEL org.opencontainers.image.documentation="https://docs.tagspaces.org"
LABEL org.opencontainers.image.authors="contact@tagspaces.org"
LABEL org.opencontainers.image.vendor="TagSpaces Authors <contact@tagspaces.org>"
# LABEL org.opencontainers.image.version="5.4.4"

# ADD https://github.com/tagspaces/tagspaces/releases/download/v5.4.4/tagspaces-web-5.4.4.zip .
# RUN mv tagspaces-web-* tagspaces-web.zip
COPY tagspaces-web.zip .
RUN unzip tagspaces-web.zip
RUN rm -rf /usr/share/nginx/html
RUN mv web /usr/share/nginx/html
# cleanup
RUN rm -rf tagspaces-web.zip

EXPOSE 80
