import { createOAuth2Request, encodeBasicCredentials,
	sendTokenRequest } from 'arctic/dist/request.js';

export class MySsoApp {
	clientId;
	clientSecret;
	redirectURI;
	constructor(clientId, clientSecret, redirectURI) {
		this.clientId = clientId;
		this.clientSecret = clientSecret;
		this.redirectURI = redirectURI;
	}
	createAuthorizationURL(state, scopes) {
		const url = new URL(process.env.SSO_AUTH_URL);
		url.searchParams.set("response_type", "code");
		url.searchParams.set("client_id", this.clientId);
		url.searchParams.set("state", state);
		url.searchParams.set("scope", scopes.join(" "));
		if (this.redirectURI !== null) {
			url.searchParams.set("redirect_uri", this.redirectURI);
		}
		return url;
	}
	async validateAuthorizationCode(code) {
		const body = new URLSearchParams();
		body.set("grant_type", "authorization_code");
		body.set("code", code);
		if (this.redirectURI !== null) {
			body.set("redirect_uri", this.redirectURI);
		}
		const request = createOAuth2Request(process.env.SSO_TOKEN_URL, body);
		const encodedCredentials = encodeBasicCredentials(this.clientId, this.clientSecret);
		request.headers.set("Authorization", `Basic ${encodedCredentials}`);
		const tokens = await sendTokenRequest(request);
		return tokens;
	}
	async refreshAccessToken(refreshToken) {
		const body = new URLSearchParams();
		body.set("grant_type", "refresh_token");
		body.set("refresh_token", refreshToken);
		const request = createOAuth2Request(process.env.SSO_TOKEN_URL, body);
		const encodedCredentials = encodeBasicCredentials(this.clientId, this.clientSecret);
		request.headers.set("Authorization", `Basic ${encodedCredentials}`);
		const tokens = await sendTokenRequest(request);
		return tokens;
	}
}
