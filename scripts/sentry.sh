#!/bin/sh

SENTRY_ORG=karigari
SENTRY_PROJECT=mercury-extension
SENTRY_AUTH_TOKEN="db82ca1be4684889b92c93092ed254b79c6b4e7a9e084a2eab821358246562b2"

VERSION=`cat build/manifest.json | jq '.version' | tr -d '"'`
JS_PATH=build/static/js

sentry-cli --auth-token $SENTRY_AUTH_TOKEN \
    releases \
    -o $SENTRY_ORG \
    -p $SENTRY_PROJECT \
    new $VERSION


sentry-cli --auth-token $SENTRY_AUTH_TOKEN \
    releases \
    -o $SENTRY_ORG \
    -p $SENTRY_PROJECT \
    files $VERSION \
    upload-sourcemaps $JS_PATH \
    --url-prefix chrome-extension://mercury/ \
    --validate
