#!/bin/bash

cd packages/core
rm -rf node_modules
yarn install -f
npm version $1
npm publish
cd ../..
git add .
git commit -m "release: publish $1"
git tag $1
git push origin master --tags
