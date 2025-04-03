import http from 'k6/http';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { check } from 'k6';
import { SharedArray } from 'k6/data';

const urllist = new SharedArray('urllist', function () {
  const f = JSON.parse(open('./example.json'));
  return f; // f must be an array[]
});

export function handleSummary(data) {
  return {
    "summary.html": htmlReport(data),
  };
}

console.log('HOST',__ENV.HOST);
console.log('VU',__ENV.VU, typeof __ENV.VU);

export const options = {
  vus: 20, // parseInt(__ENV.VU, 10), // parallel Virtual Users (VUs)
  duration: '60s', // __ENV.DURATION || '60s', // test run time,
  thresholds: {
    // 90% of requests must finish within 200ms, 95% within 400, and 99.9% within 800ms.
    'http_req_duration{type:api}': ['p(90) < 200', 'p(95) < 400', 'p(99.9) < 800'],

    // 90% of requests must finish within 400ms, 95% within 800, and 99.9% within 1s.
    'http_req_duration{type:cms}': ['p(90) < 400', 'p(95) < 800', 'p(99.9) < 1000'],

    // 90% of requests must finish within 400ms, 95% within 800, and 99.9% within 1s.
    'http_req_duration{type:category}': ['p(90) < 400', 'p(95) < 800', 'p(99.9) < 1000'],

    // 90% of requests must finish within 400ms, 95% within 800, and 99.9% within 1s.
    'http_req_duration{type:product}': ['p(90) < 400', 'p(95) < 800', 'p(99.9) < 1000'],
  },
};

export default function () {
  urllist.forEach((item) => {
    const res = http.get(`${__ENV.HOST}${item.url}`, {
      tags: { type: item.tag },
    });
    check(res, { 'status 200': (r) => r.status === 200 });
  });
}