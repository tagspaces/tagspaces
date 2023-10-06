FROM nginx:1.25.2-alpine
LABEL org.opencontainers.image.title="TagSpaces Web"
LABEL org.opencontainers.image.description="Official build of TagSpaces for Docker."
LABEL org.opencontainers.image.url="https://www.tagspaces.org"
LABEL org.opencontainers.image.source="https://github.com/tagspaces/tagspaces"
LABEL org.opencontainers.image.documentation="https://docs.tagspaces.org"
LABEL org.opencontainers.image.authors="contact@tagspaces.org"
LABEL org.opencontainers.image.vendor="TagSpaces Authors <contact@tagspaces.org>"
LABEL org.opencontainers.image.version="5.5.2"
ADD https://github.com/tagspaces/tagspaces/releases/download/v5.5.2/tagspaces-web-5.5.2.zip .
RUN mv tagspaces-web-* tagspaces-web.zip
# COPY tagspaces-web.zip .
RUN unzip tagspaces-web.zip
RUN rm -rf /usr/share/nginx/html
RUN mv web /usr/share/nginx/html
# cleanup
RUN rm -rf tagspaces-web.zip

EXPOSE 80
