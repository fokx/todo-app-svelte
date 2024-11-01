## A TODO App using sveltekit

## Features
* Data stored in the browser IndexedDB using [Dexie.js](https://dexie.org/) when offline.
* Support login with GitHub and synchronized with the server side SQLite database to use this app on different devices.

## Developing

```bash
pnpm run dev
# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```


## Building

To create a production version of your app:

```bash
pnpm run build
```

You can preview the production build with `pnpm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Small bugs and caveats
* in `/deleted` page, `---None---` is not shown when there is no deleted todos
* double-clicking on the 'new todo' input field will cause double submission

## Dev Notes
setting cookies for `127.0.0.1` is different from `localhost`.