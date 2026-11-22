#!/bin/bash
# Stop at the first error, so that a failed build is never pushed.
set -e
npm run build
( cd dist
 git init
 git add .
 git commit -m "Deployed to Github Pages"
 git push --force git@github.com:anvaka/redsim main:gh-pages
)
