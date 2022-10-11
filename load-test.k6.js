import { SharedArray } from "k6/data";
import { scenario } from 'k6/execution';
import http from 'k6/http';
import { check } from 'k6';
import encoding from 'k6/encoding';

export const options = {
    // executor: 'shared-iterations',
    vus: 10,
    iterations: 10,
    // maxDuration: '1h',
}

const username = 'ozgsec';
const password = __ENV.K6_PASSWORD;


const domains = new SharedArray("some data name", function () {
    return JSON.parse(open("./top-10_000.json")).domains;
});

const credentials = `${username}:${password}`;
const encodedCredentials = encoding.b64encode(credentials);

export default function () {
    const site = domains[scenario.iterationInTest]

    const res = http.get(`https://ozgsec.neuland-homeland.de/api/scan?site=${site}`, {
        headers: {
            Authorization: `Basic ${encodedCredentials}`,
        },
    });


    console.log(res.status)
    check(res, {
        'status is 200': (r) => r.status === 200,
    });
}
