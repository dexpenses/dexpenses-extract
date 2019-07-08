command -v jq >/dev/null 2>&1 || { echo >&2 "'jq' JSON query tool is required but it's not installed: Visit https://stedolan.github.io/jq/"; exit 1; }


gsutil ls -l  "gs://dexpenses-207219-test-images/**" | grep $(date +%Y-%m-%d) | grep -o "gs://.*" | while read url
do
  file=$(basename $url)
  rel_path=$(basename $(dirname $url))/$file
  echo "Analyzing $rel_path"
  filename="${file%.*}"
  mkdir -p $(dirname data/$rel_path)
  target=$(dirname data/$rel_path)/$filename.txt.inactive
  gcloud ml vision detect-text $url | jq -r '.responses[0].fullTextAnnotation.text' > $target
  status=$?
  if [ $status -ne 0 ]; then
    rm data/$1.txt
    exit $status
  fi
done
