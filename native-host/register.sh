#!/bin/bash

cd $(dirname $0)

PACKAGE_NAME=rubberduck-native
NPM_ROOT=`npm root -g`

echo $PACKAGE_NAME
echo $NPM_ROOT

BINARY=$NPM_ROOT\/$PACKAGE_NAME\/bin\/rubberduck-native

# Make temp.json with the correct path
jq ".path = \"$BINARY\"" io.rubberduck.native.json > temp.json

# Move the json to chrome location
mkdir -p ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts
mv temp.json ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/io.rubberduck.native.json
