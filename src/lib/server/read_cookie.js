// const crypto = require('crypto');
import crypto from 'crypto';
import 'dotenv/config';

// import {clients} from '$lib/clients.js';

export function read_user(valueOfLoggedInCookie) {
	try {
		// Get the value of the `logged_in` cookie from where ever makes sense
		// in your application. The browser should send it to your backend.
		// For this example, it is hard-coded.
		const uriDecodedPayload = decodeURIComponent(valueOfLoggedInCookie);
		const base64DecodedBuffer = Buffer.from(uriDecodedPayload, 'base64');
		const preJsonPayload = JSON.parse(base64DecodedBuffer.toString());
		const jsonPayload = {
			username: preJsonPayload.username,
			user_id: preJsonPayload.user_id,
			avatar: preJsonPayload.avatar,
			group: preJsonPayload.group
		};
		const payloadSha = crypto
			.createHash('sha256')
			.update(JSON.stringify(jsonPayload))
			.digest('hex');
		const signed = crypto
			.createHmac('sha256', process.env.COOKIE_KEY)
			.update(payloadSha)
			.digest('hex');

		if (signed === preJsonPayload.hmac) {
			// clients.get('some-session-id').emit('message', 'hello')
			return jsonPayload;
		}
		return undefined;
	} catch (error) {
		console.error(error);
		return undefined;
	}
}
