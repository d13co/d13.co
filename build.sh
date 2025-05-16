#!/usr/bin/env bash

if [ "$CF_PAGES_BRANCH" = "main" ]; then
  hugo --baseURL "https://d13.co"
else
  hugo --baseURL "$CF_PAGES_URL"
fi
