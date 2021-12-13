
FROM docker.elastic.co/elasticsearch/elasticsearch:6.8.19

COPY synonyms.txt /usr/share/elasticsearch/config/synonyms.txt

RUN echo "discovery.type: single-node" >> /usr/share/elasticsearch/config/elasticsearch.yml
