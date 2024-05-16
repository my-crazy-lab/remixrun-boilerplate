import promClient from 'prom-client';

export const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'routeName', 'statusCode'],
  buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500], // buckets for response time from 0.1ms to 500ms
});

export const httpRequestFailureCounter = new promClient.Counter({
  name: 'http_request_failure_counter',
  help: 'Counter of HTTP requests failure',
});
