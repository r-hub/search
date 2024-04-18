import wait_port from 'wait-port';
import url from 'url';
import got from 'got';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'node:fs/promises';

async function init_elastic() {
  try {
    const es_url = process.env.ELASTICSEARCH_URL;
    if (!url) {
      throw 'ELASTICSEARCH_URL is not set, exiting';
    }

    const params = url.parse(es_url);
    await wait_port({
      host: params.hostname,
      port: parseInt(params.port),
      timeout: 1000 * 60 * 60,
      waitForDns: true
    })

    const http_url = "http://" + params.hostname + ":" + params.port + "/package";
    const resp = await got(http_url, { throwHttpErrors: false });
    if (resp.statusCode != 200) {
      await create_mapping(http_url);
    }

    const search_url = http_url + '/_search';
    const jresp = await got(search_url).json();
    if (jresp.hits.total.value == 0) {
      await add_data(http_url);
    }

  } catch(err) {
    throw 'Failed to initialize elasticsearch server: ' + err;
  }
}

async function create_mapping(url) {
  console.log("Adding ElasticSerarch mapping")

  const mapping = await fs.readFile(
    path.join(__dirname, "mapping.json"),
    'UTF-8'
  );

  await got(url, {
    method: "PUT",
    body: mapping,
    headers: {
      'content-type': 'application/json'
    }
  });

  console.log("Added ElasticSerarch mapping")
}

async function add_data(url) {
  console.log("Adding ElasticSearch data")

  const alldocs1 = await fs.readFile(
    path.join(__dirname, "docs1.json"),
    'UTF-8'
  );
  const alldocs2 = await fs.readFile(
    path.join(__dirname, "docs2.json"),
    'UTF-8'
  );
  const docs1 = JSON.parse(alldocs1);
  const docs2 = JSON.parse(alldocs2);
  const docs = docs1.hits.hits.concat(docs2.hits.hits);
  for (const doc of docs) {
    const doc_url = url + '/_doc/' + doc._id;
    const resp = await got(doc_url, {
      method: 'PUT',
      json: doc._source
    });
  }

  console.log("Added ElasticSearch data: " + docs.length + ' packages');
}

export default init_elastic;
