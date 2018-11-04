
set -e

while true
do
    echo "waiting for DB"
    status=$(curl -s -o /dev/null -w "%{http_code}" \
		  http://elasticsearch:9200/package || echo 500)
    if [ "x$status" == "x200" ]; then break; fi
    sleep 1
done

nginx -g "daemon off;"
