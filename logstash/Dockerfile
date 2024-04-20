FROM logstash:7.17.20

RUN logstash-plugin install logstash-input-couchdb_changes
RUN logstash-plugin install logstash-filter-ruby

COPY logstash/logstash.conf /usr/share/logstash/config/logstash.conf
COPY logstash/crandb-filter.rb /usr/share/logstash/config/crandb-filter.rb

USER logstash

CMD ["-f", "/usr/share/logstash/config/logstash.conf"]
