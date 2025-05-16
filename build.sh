#!/usr/bin/env bash

if [ "$CF_PAGES_BRANCH" = "main" ]; then
  hugo --baseURL "https://d13.co"
elif [[ "$CF_PAGES_BRANCH" =~ ^testnet ]]; then
  hugo --baseURL "https://testnet.d13-co.pages.dev"
else
  hugo --baseURL "$CF_PAGES_URL"
fi
