FROM nginx:1.27-alpine

# gettext provides envsubst
RUN apk add --no-cache gettext

COPY db.conf.template /etc/nginx/conf.d/db.conf.template
COPY entrypoint.sh    /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
