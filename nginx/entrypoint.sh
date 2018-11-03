
set -e

wait-for elasticsearch:9200 -- nginx -g "daemon off;"
