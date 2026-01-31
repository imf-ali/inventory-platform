/**
 * Handle /favicon.ico so it doesn't hit the document handler and cause "No routes matched".
 * Return 204 so the tab has no custom icon.
 */
export async function loader() {
  return new Response(null, { status: 204 });
}

export default function FaviconRoute() {
  return null;
}
