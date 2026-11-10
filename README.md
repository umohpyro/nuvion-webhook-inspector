# Hookline: a Nuvion webhook inspector

A small debugging tool for [Nuvion](https://docs.nuvion.co) webhooks on the sandbox. You register an endpoint, fire a sample event at it, read every delivery Nuvion attempted (headers, payload, your endpoint's response), and check the HMAC signature in your browser. It has **no database**: Nuvion's own webhook log holds all state. It runs on Next.js 16, React 19, Tailwind CSS 4 and shadcn/ui.

> Independent demo. Sandbox only, no real money. Not affiliated with or endorsed by any payment scheme. See [the privacy page](/privacy).

## What it shows

| Page | What it demonstrates | Nuvion calls |
|---|---|---|
| Webhooks `/webhooks` | Register a webhook for every event, send a test event for any group and name, delete a webhook | `POST /entity-webhooks`, `GET /entity-webhooks`, `POST /webhook-tests`, `DELETE /entity-webhooks/{id}` |
| Deliveries `/deliveries` | Every delivery attempt, newest first: request headers, request body, your endpoint's answer, duration, and a signature check | `GET /webhook-logs` |
| Verify `/verify` | Recompute the signature from a timestamp, raw body and secret, entirely in the browser | none |
| Settings `/settings` | Bring your own key and entity | `GET /entities`, `GET /entity-webhooks` |

The default delivery URL is the app's own receiver, `/api/hook`. It accepts any POST, answers `200 OK` and stores nothing. A production receiver would verify the signature first, as [Verifying webhook signatures](https://docs.nuvion.co/webhooks/overview#verifying-webhook-signatures) describes.

## Run it

The app is bring-your-own-key. Nothing about your Nuvion account is stored on the server or shared between visitors: each visitor connects their own sandbox on the **Settings** page, and everything runs in their own tenant.

You need Node.js 20.9 or later and a Nuvion **sandbox** account with an approved entity.

```bash
npm install
npm run dev
```

Open http://localhost:3000/settings, paste your sandbox API key (from the sandbox dashboard, [Settings > Developers](https://app.nuvion.dev/dashboard/settings)), then pick an entity or enter its ID. Your key is sealed in an `httpOnly` cookie that expires after eight hours.

Nuvion delivers only to `https` URLs, so on `localhost` register a public URL (a tunnel, or a deployed copy of this app) instead of the default.

| Variable | Description |
|---|---|
| `SESSION_SECRET` | Required in production: a long random string that seals the cookie. Local development generates one for you |
| `PUBLIC_APP_URL` | Optional. The public URL, used for the Open Graph image |
| `NUVION_API_URL` | Optional. Must be a `*.nuvion.dev` host |

Checks:

```bash
npm test
npm run typecheck
npm run lint
```

## What to know about Nuvion webhooks before you build this

1. **`expires_in` is required** on `POST /entity-webhooks`, even though the API never expires the webhook. This app sends 30 days.
2. **The secret is returned once,** in the create response. It starts with `nv_wsk_`. Keep the whole string: it is the HMAC key.
3. **The signature covers `{timestamp}.{raw body}`.** Use the `x-nuvion-event-timestamp` header exactly as received, including milliseconds, and compute over the raw bytes. Re-serializing parsed JSON can change the bytes and break the match. The delivery log stores the body as parsed JSON, so the in-page check there is a convenience, not a substitute for verifying the raw request.
4. **Nuvion's own log is the event history.** `GET /webhook-logs` returns every attempt, retries and test deliveries included, so a receiver does not need to store events to be debuggable.
5. **A test event is one attempt with no retries,** and it does not count toward blacklisting. A real endpoint that keeps failing is blacklisted, and the webhook list shows `blacklisted` as its status.
6. **Not every key can do everything.** What a key can do depends on its role:

   | Key role | Lists entities | Manages webhooks | Works with Hookline |
   |---|---|---|---|
   | Owner | Yes | Yes | Yes |
   | Developer | No | Yes | Yes, enter the entity ID yourself |
   | Admin | Yes | No | No |
   | Operation | No | No | No |

   That is why Settings also accepts an entity ID.

## Security

See [SECURITY.md](SECURITY.md). Keys are sealed with AES-256-GCM in an `httpOnly` cookie, never sent to client JavaScript, and the app refuses any Nuvion host that is not `*.nuvion.dev`.

## License

MIT
