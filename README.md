## An TODO App using sveltekit

## Features (WIP)
* Data stored in the browser IndexedDB using [Dexie.js](https://dexie.org/) when offline.
* Support login with GitHub and synchronized with the server side SQLite database to use this app on different devices.

## Developing

```bash
pnpm run dev
# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

### Configure 'Login with GitHub'
Configure a [GitHub OAuth App](https://github.com/settings/developers) and 
set the `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in the `.env` file using [env.example](./env.example) as a template.
For local testing, the callback URL should be `http://localhost:5173/login/github/callback`.
For production deployment, the callback URL should set as `https://<domain_name>/login/github/callback`.

## Building

To create a production version of your app:

```bash
pnpm run build
```

You can preview the production build with `pnpm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
