/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

import { build, files, version } from '$service-worker';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;
console.log('installing service worker', CACHE);
const ASSETS = [
	...build, // the app itself
	...files  // everything in `static`
];

navigator.connection.onchange = (e) => {
	if (navigator.onLine) {
		console.log("You are online");
		self.clients.matchAll().then(clients => {
			console.log('sending online message to clients');
			clients.forEach(client => client.postMessage({ type: 'ONLINE_STATUS', online: true }));
		})
	} else {
		console.log("You are offline");
		self.clients.matchAll().then(clients => {
			console.log('sending offline message to clients');
			clients.forEach(client => client.postMessage({ type: 'ONLINE_STATUS', online: false }));
		})
	}
};

/* // this doesn't work:
// sw.addEventListener('online', () => {
// 	console.log('online, sending message to clients');
// 	sw.clients.matchAll().then(clients => {
// 		clients.forEach(client => client.postMessage({ type: 'ONLINE_STATUS', online: true }));
// 	});
// });

// sw.addEventListener('offline', () => {
// 	console.log('offline, sending message to clients');
// 	sw.clients.matchAll().then(clients => {
// 		clients.forEach(client => client.postMessage({ type: 'ONLINE_STATUS', online: false }));
// 	});
// });
*/


sw.addEventListener('install', (event) => {
	// Create a new cache and add all files to it
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

sw.addEventListener('activate', (event) => {
	// Remove previous cached data from disk
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}
	// event.waitUntil(clients.claim());
	event.waitUntil(deleteOldCaches());
});

sw.addEventListener('fetch', (event) => {
	// ignore POST requests etc
	if (event.request.method !== 'GET') return;

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// `build`/`files` can always be served from the cache
		if (ASSETS.includes(url.pathname)) {
			const response = await cache.match(url.pathname);

			if (response) {
				return response;
			}
		}

		// for everything else, try the network first, but
		// fall back to the cache if we're offline
		try {
			const response = await fetch(event.request);

			// if we're offline, fetch can return a value that is not a Response
			// instead of throwing - and we can't pass this non-Response to respondWith
			if (!(response instanceof Response)) {
				throw new Error('invalid response from fetch');
			}

			if (response.status === 200) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch (err) {
			const response = await cache.match(event.request);

			if (response) {
				return response;
			}

			// if there's no cache, then just error out
			// as there is nothing we can do to respond to this request
			throw err;
		}
	}

	event.respondWith(respond());
});
