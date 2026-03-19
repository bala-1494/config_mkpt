# PocketBase — self-hosted backend
FROM alpine:3.19

ARG PB_VERSION=0.22.14

RUN apk add --no-cache \
    ca-certificates \
    unzip \
    wget

# Download PocketBase binary
RUN wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" \
    -O /tmp/pocketbase.zip && \
    unzip /tmp/pocketbase.zip -d /pb && \
    rm /tmp/pocketbase.zip && \
    chmod +x /pb/pocketbase

# Persist data in a named volume
VOLUME ["/pb/pb_data"]

# Copy custom migrations and hooks if any
COPY pb_migrations/ /pb/pb_migrations/
COPY pb_hooks/      /pb/pb_hooks/

# Cloud Run injects PORT; default to 8090 for local/compose use.
ENV PORT=8090
EXPOSE 8090

# Use shell form so $PORT is expanded at runtime.
CMD /pb/pocketbase serve --http=0.0.0.0:${PORT}
