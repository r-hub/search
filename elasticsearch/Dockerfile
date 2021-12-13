
FROM docker.elastic.co/elasticsearch/elasticsearch:6.4.2

COPY synonyms.txt /usr/share/elasticsearch/config/synonyms.txt

RUN echo "discovery.type: single-node" >> /usr/share/elasticsearch/config/elasticsearch.yml
