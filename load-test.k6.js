import { sleep } from 'k6';
import { scenario } from 'k6/execution';
import http from 'k6/http';

export const options = {
    // discardResponseBodies: true,
    thresholds: {
        http_req_failed: ['rate<0.01'], // http errors should be less than 1%
        http_req_duration: ['p(95)<10000'], // 95% of requests should be below 10 seconds
    },
    // Key configurations for breakpoint in this section
    executor: 'ramping-arrival-rate', //Assure load increase if the system slows
    stages: [
        { duration: '2h', target: 2000 }, // just slowly ramp-up to a HUGE load
    ],
}

const maxCollections = 50;

export default function () {
    const collection = scenario.iterationInTest % maxCollections;

    http.get(`http://localhost:3000/dashboard/trends?forceCollection=${collection}`);
}
