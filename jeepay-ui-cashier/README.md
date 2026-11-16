# jeepay-ui-cashier

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### OAuth callback regression tests

The test tools require Node.js 20.19+ (or 22.12+/24+).

```sh
npm ci
npm run test:oauth
npm run build
```

The DOM integration suite mounts the actual Vue application and hash router in
jsdom with a test-only Axios adapter: query precedence, invalid/error responses,
stale IDs, Back navigation, interrupted requests, and a newer callback reusing
the component. CI runs this suite and the production build without installing
or launching a browser.
No WeChat credentials, live backend, or payment transactions are used. These tests
do not replace verification in the real WeChat client with a configured backend.
For manual browser inspection, run `npm run dev -- --mode test` and open
`/tests/oauth-callback.html`, then click **Run tests**. Test harness pages are not
included in the production build.
