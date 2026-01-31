/**
 * Handle /.well-known/appspecific/com.chrome.devtools.json
 * Chrome DevTools requests this automatically. Return 204 so it doesn't hit the document handler.
 */
export async function loader() {
  return new Response(null, { status: 204 });
}

export default function WellKnownChromeDevToolsRoute() {
  return null;
}
