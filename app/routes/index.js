import express from 'express';
import got from 'got';
import url from 'url';

var router = express.Router();

const es_url = process.env.ELASTICSEARCH_URL;
if (!url) {
  throw 'ELASTICSEARCH_URL is not set, exiting';
}

const params = url.parse(es_url);
const baseurl = 'http://' + params.hostname + ':' + params.port;

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

function post_process(txt) {
  var obj = JSON.parse(txt);
  if (obj.hits && obj.hits.total && obj.hits.total.value !== undefined) {
    obj.hits.total = obj.hits.total.value;
  }
  return JSON.stringify(obj);
}

// TODO: we really should stream these

router.get('/package/_search', async function(req, res, next) {
  const qurl = baseurl + req.originalUrl;
  const eres = await got(qurl, { throwHttpErrors: false });
  res
    .set('content-type', 'application/json')
    .status(eres.statusCode)
    .send(post_process(eres.body));
});

router.post('/package/_search',
  express.text({ type: 'application/json' }),
  async function(req, res, next) {
    const qurl = baseurl + req.originalUrl;
    const eres = await got.post(qurl, {
      throwHttpErrors: false,
      body: req.body,
      headers: {
        'content-type': 'application/json'
      }
    });
    res
      .set('content-type', 'application/json')
      .status(eres.statusCode)
      .send(post_process(eres.body));
  }
);

export default router;
