#!/bin/bash

if [[ $VERCEL_GIT_COMMIT_REF == "main"  ]] ; then
  echo "main branch"
  yarn run build:prod
else
  echo "not:main branch"
  yarn run build:dev
fi
