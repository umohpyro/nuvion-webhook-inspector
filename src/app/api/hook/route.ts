/**
 * The default delivery target. It accepts any POST and answers 200 so Nuvion records the delivery as successful.
 * It stores nothing: read what arrived on the Deliveries page, which lists Nuvion's own delivery log.
 * A real receiver would verify the signature first (see the Verify page) and only then act on the event.
 */
export async function POST(request: Request) {
  await request.arrayBuffer(); // drain the body
  return new Response("OK", { status: 200 });
}

export function GET() {
  return new Response("This URL receives Nuvion webhook deliveries (POST).", { status: 200 });
}
