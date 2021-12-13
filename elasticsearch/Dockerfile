
FROM docker.elastic.co/elasticsearch/elasticsearch:7.16.0

COPY synonyms.txt /usr/share/elasticsearch/config/synonyms.txt

RUN echo "discovery.type: single-node" >> /usr/share/elasticsearch/config/elasticsearch.yml
