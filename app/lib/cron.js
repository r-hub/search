import { CronJob } from 'cron';
import got from 'got';

const CRON_JOB_UPDATE = '50 15 3 * * *';

const CRANDB_REVDEPS =
	'https://crandb.r-pkg.org:2053/cran/_design/internal/_view/' +
	'numrevdeps?group=true';
const CRANLOGS = "https://cranlogs.r-pkg.org/downloads/monthly-totals";
const ES_URL = process.env.ELASTICSEARCH_URL;

async function init_cron() {
	const job = CronJob.from({
		cronTime: CRON_JOB_UPDATE,
		onTick: async function () {
			// Reverse dependency numbers
			try {
				var resp = await got(CRANDB_REVDEPS).json();
				var rdps = resp.rows;
				console.log('Updating ' + rdps.length + ' package revdeps');
				for (const rdp of rdps) {
					var pkg = rdp.key;
					var num = rdp.value;
					var body = { 'doc': { 'revdeps': num } };
					const url = ES_URL + '/package/_update/' + pkg;
					try {
						await got.post(url, {
							headers: {
								'content-type': 'application/json'
							},
							body: JSON.stringify(body)
						})
					} catch (error) {
						console.log('Could not update ' + pkg + ' revdeps: ' +
							error);
					}
				}
			} catch (error) {
				console.log('Could not update revdeps: ' + error);
			}

			// Download numbers, relative to the largest
			try {
				var dlds = await got(CRANLOGS).json();
				console.log('Updating ' + dlds.length + ' package downloads');
				for (const dld of dlds) {
					var pkg = dld.package;
					var num = Number(dld.count);
					var body = { 'doc': { 'downloads': num } };
					const url = ES_URL + '/package/_update/' + pkg;
					try {
						await got.post(url, {
							headers: {
								'content-type': 'application/json'
							},
							body: JSON.stringify(body)
						})
					} catch (error) {
						console.log('Could not update ' + pkg +
							' downloads: ' + error);
					}
				}

			} catch (error) {
				console.log('Could not update download numbers ' + error);
			}

		},
		start: false,
		runOnInit: false
	});
	return job;
}

export default init_cron;
