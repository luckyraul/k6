import http from 'k6/http';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { check } from 'k6';
import { SharedArray } from 'k6/data';

const urllist = new SharedArray('urllist', function () {
  try {
    const file = open('./data.json');
    return JSON.parse(file);
  } catch (error) {
    console.log(`File data.json does not exist.`, error);
    const file = open('./example.json');
    return JSON.parse(file);
  }
});

export function handleSummary(data) {
  return {
    "summary.html": htmlReport(data),
  };
}

const createStages = (max) => Array.from(Array(max).keys()).map(i => ({ target: i+1, duration: `${10+i}s` }));

export const options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: 'ramping-arrival-rate',
      startRate: 1,
      timeUnit: __ENV.DURATION || '60s',
      preAllocatedVUs: 1,
      stages: createStages(parseInt(__ENV.VU || 20)),
      maxVUs: parseInt(__ENV.VU || 20),
    },
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