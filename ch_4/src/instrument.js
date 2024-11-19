import dotenv from 'dotenv';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

dotenv.config();

Sentry.init ({
    dsn: process.env.DSN,
    integrations: [
        nodeProfilingIntegration(),
    ],
    tracesSampleRate: 1.0,
});

Sentry.profiler.startProfiler();

Sentry.profiler.stopProfiler();