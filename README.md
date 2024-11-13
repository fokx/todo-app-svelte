## Svelte Todo

An offline-first TODO app built with SvelteKit, with automatic data synchronization with server in the background.

## Develop / Deploy 

To create a production version of your app:

```bash
pnpm i
pnpm push:db
# dev
pnpm dev --port 4001
# deploy (reverse proxy needed)
pnpm run build && killall -9 node ; HOST=127.0.0.1 PORT=4001 node build
```

## Note
* Currently, clients will sync data with server every 5 seconds. It will be better to use server sent event.
* setting cookies for `127.0.0.1` is different from `localhost`.
* data syncing / merging policy:
  * resolve data discrepancies between server and local storage on *local* side and send differences to server
  * for diverging items with the same id, those with the newest `updated_by` are kept
  * you may need to wait for several seconds to see the latest data on other devices
