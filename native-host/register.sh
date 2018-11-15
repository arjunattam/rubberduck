#!/bin/bash

cd $(dirname $0)

mkdir -p ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts
cp io.rubberduck.native.json ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts
