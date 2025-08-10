#!/bin/sh
set -e

# Substitute environment variables in the template and create env.js
envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js

echo "Environment variables substituted:"
cat /usr/share/nginx/html/env.js

# Start nginx
exec "$@"