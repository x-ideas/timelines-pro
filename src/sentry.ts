import * as Sentry from '@sentry/node';

Sentry.init({
	dsn: 'https://7a065d4b678c49cf9007e7e35ffa3edd@o311015.ingest.sentry.io/4505598330404864',

	// Performance Monitoring
	tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
});
