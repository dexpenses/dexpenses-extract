#!/bin/bash
set -o pipefail

command -v jq >/dev/null 2>&1 || { echo >&2 "'jq' JSON query tool is required but it's not installed: Visit https://stedolan.github.io/jq/"; exit 1; }

mkdir -p $(dirname data/$1)

ext=${2:-JPEG}
gcloud ml vision detect-text gs://dexpenses-207219-test-images/$1.$ext | jq -r '.responses[0].fullTextAnnotation.text' > data/$1.txt
status=$?
if [ $status -ne 0 ]; then
  rm data/$1.txt
  exit $status
fi
