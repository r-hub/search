# 2024-04

## Move from old server

This is running as a docker-compose (docker stack) project on Azure.
I'll try to convert it to a web app with an elasticsearch service,
where the web app only filters and forwards.

Alternatively, we could also run it ourselves fro the Dockerfile.

Let's see.

```
dokku plugin:install https://github.com/dokku/dokku-elasticsearch.git elasticsearch
echo 'vm.max_map_count=262144' | sudo tee -a /etc/sysctl.conf; sudo sysctl -p
dokku elasticsearch:create cran
```

```
dokku apps:create cran-search
dokku elasticsearch:link cran cran-search
```

Export documents from the old DB with the scrool api, see
https://www.elastic.co/guide/en/elasticsearch/reference/6.8/search-request-scroll.html

```
curl -X POST -H 'Content-Type: application/json' http://localhost:9200/package/_search?scroll=10m -d '{ "size": 20000 }' > out1.json
curl -X POST -H 'Content-Type: application/json' http://localhost:9200/_search/scroll -d '{ "scroll": "1m", "scroll_id" : "<scrool-id>" }' > out2.json
```

Two rounds are eonugh for the ~22k CRAN packages.

Need to update the mapping, first for the removal of the 'standard' filter,
then for the removal of mapping types:
https://www.elastic.co/guide/en/elasticsearch/reference/7.17/removal-of-types.html

Update web app, push to dokku:

```
dokku builder-dockerfile:set cran-search dockerfile-path app/Dockerfile
git remote add dokku dokku@api.r-pkg.org:cran-search
git push dokku
```

Add certs for the api.r-pkg.org subdomain first:
```
dokku letsencrypt:set cran-search email csardi.gabor@gmail.com
dokku letsencrypt:enable cran-search
```

Now test that http -> https redirection is fine, because the pkgsearch package
uses http. It it not fine, beacuse redirected POST requests do not re-send the
body. So we cannot use redirection.

We need to set up dokku / nginx not to redirect, and then we can start using
https. For now just add the domain:
```
dokku letsencrypt:disable cran-search
dokku domains:add cran-search search.r-pkg.org
```

# 2024-04-19

Avoiding the http -> https redirection seems surprisingly difficult
in Dokku, so we'll need another strategy. E.g. have another dokku app
that servers https only, and then later switch to that completely.

# 2024-04-20

Implementing updates. This needs a logstash container by us, running as
another app.

We need to hardcode the host name of the elasticsearch server, which is
`dokku-elasticsearch-cran` on dokku, so we add this as an alias in
`docker-compose.yml`, so logstash can be tested locally as well.
```
dokku apps:create cran-search-logstash
dokku elasticsearch:link cran cran-search-logstash
dokku builder-dockerfile:set cran-search-logstash \
  dockerfile-path logstash/Dockerfile
```

We'll create a bind mount for the data, so it is kept between
deployments:
```
mkdir /logstash-data
dokku storage:mount cran-search-logstash \
    /logstash-data:/usr/share/logstash/data
```

Locally:
```
git remote add dokku-logstash dokku@api.r-pkg.org:cran-search-logstash
git push dokku-logstash
```
