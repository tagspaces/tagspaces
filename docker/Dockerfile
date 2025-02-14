FROM nginx:1.27.1-alpine
LABEL org.opencontainers.image.title="TagSpaces Web"
LABEL org.opencontainers.image.description="Official Docker image for TagSpaces"
LABEL org.opencontainers.image.url="https://www.tagspaces.org"
LABEL org.opencontainers.image.source="https://github.com/tagspaces/tagspaces"
LABEL org.opencontainers.image.documentation="https://docs.tagspaces.org"
LABEL org.opencontainers.image.authors="contact@tagspaces.org"
LABEL org.opencontainers.image.vendor="TagSpaces Authors <contact@tagspaces.org>"
LABEL org.opencontainers.image.version="6.3.1"
RUN echo "types { application/javascript js mjs; }" > /etc/nginx/conf.d/types.conf
ADD https://github.com/tagspaces/tagspaces/releases/download/v6.3.1/tagspaces-web-6.3.1.zip .
RUN mv tagspaces-web-* tagspaces-web.zip
RUN unzip tagspaces-web.zip
RUN mv web/extconfig.tmpl.js web/extconfig.js
RUN rm -rf /usr/share/nginx/html
RUN mv web /usr/share/nginx/html
RUN rm -rf tagspaces-web.zip
EXPOSE 80
