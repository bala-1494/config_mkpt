#!/bin/sh
set -e

: "${DOMAIN_NAME:?DOMAIN_NAME environment variable is required}"

# Substitute only ${DOMAIN_NAME} — nginx's own $variables are left untouched
# because envsubst only replaces the variables named in the second argument.
envsubst '${DOMAIN_NAME}' \
    < /etc/nginx/conf.d/db.conf.template \
    > /etc/nginx/conf.d/db.conf

# Validate configuration before handing off to nginx
nginx -t

exec nginx -g 'daemon off;'
