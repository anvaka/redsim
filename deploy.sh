#!/bin/bash
npm run build
( cd dist
 git init
 git add .
 git commit -m "Deployed to Github Pages"
 git push --force git@github.com:anvaka/redsim master:gh-pages
)
