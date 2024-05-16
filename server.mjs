import { createRequestHandler } from '@remix-run/express';
import { broadcastDevReady } from '@remix-run/node';
import 'dotenv/config';
import express from 'express';
import promBundle from 'express-prom-bundle';

// notice that the result of `remix build` is "just a module"
import * as build from './build/index.js';

const app = express();
app.use(express.static('public'));

const metrics = promBundle({ includeMethod: true });
app.use(metrics);

app.use((req, res, next) => {
  res.locals.startEpoch = Date.now();
  next();
});

app.all('*', createRequestHandler({ build }));

if (process.env.PORT) {
  console.error("If don't config PORT for Remix server, can't register APM");
}
const port = process.env.PORT || 3000;
app.listen(port, () => {
  if (process.env.NODE_ENV === 'development') {
    broadcastDevReady(build);
  }
  console.log(`App listening on http://localhost:${port}`);
});
