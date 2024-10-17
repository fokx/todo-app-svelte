## A TODO App using sveltekit

## Features
* Data stored in the browser IndexedDB using [Dexie.js](https://dexie.org/) when offline.
* Support login with GitHub and (WIP) synchronized with the server side SQLite database to use this app on different devices.

## Developing

```bash
pnpm run dev
# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

### Configure 'Login with GitHub'
Configure a [GitHub OAuth App](https://github.com/settings/developers) and 
set the `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `GITHUB_REDIRECT_URL` in the `.env` file. Use [env.example](./env.example) as a template.
For local testing, the callback URL should be `http://localhost:5173/login/github/callback`.
For production deployment, the callback URL should set as `https://<domain_name>/login/github/callback`.

## Building

To create a production version of your app:

```bash
pnpm run build
```

You can preview the production build with `pnpm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Small bugs and caveats
* in `/deleted` page, `---None---` is not shown when there is no deleted todos, which is unexpected and wierd.
* after click the sign-in button, the sign-in button does not disappear.
* deletion icon not working, which is borrowed from [svelte tutorial](https://learn.svelte.dev/tutorial/progressive-enhancement).
* dark mode not work temporarily