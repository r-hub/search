FROM logstash:7.17.20

RUN logstash-plugin install logstash-input-couchdb_changes
RUN logstash-plugin install logstash-filter-ruby

COPY logstash/logstash.conf /usr/share/logstash/config/logstash.conf
COPY logstash/crandb-filter.rb /usr/share/logstash/config/crandb-filter.rb

# disable license checker, otherwise it keeps warning about a host
# 'elasticsearch' being unreachable
RUN echo 'xpack.monitoring.enabled: false' >> \
    /usr/share/logstash/config/logstash.yml

USER logstash

CMD ["-f", "/usr/share/logstash/config/logstash.conf"]
