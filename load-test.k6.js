import { SharedArray } from "k6/data";
import { scenario } from 'k6/execution';
import http from 'k6/http';
import encoding from 'k6/encoding';

export const options = {
    discardResponseBodies: true,
    stages: [
        { duration: "5m", target: 150 },
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'], // http errors should be less than 1%
        http_req_duration: [{
            threshold: 'p(95)<20000',
            abortOnFail: true,
            delayAbortEval: '5s'
        }], // 95% of requests should be below 10 seconds
    },
}

const username = 'ozgsec';
const password = __ENV.K6_PASSWORD;


const domains = new SharedArray("some data name", function () {
    return JSON.parse(open("./top-10_000.json")).domains;
});

const credentials = `${username}:${password}`;
const encodedCredentials = encoding.b64encode(credentials);

export default function () {
    const site = domains[scenario.iterationInTest % domains.length];

    http.get(`https://dev.ozgsec.neuland-homeland.de/api/scan?site=${site}`, {
        headers: {
            Authorization: `Basic ${encodedCredentials}`,
        },
    });
}
