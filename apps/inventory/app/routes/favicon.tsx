import { redirect } from 'react-router';

/**
 * Handle /favicon.ico so it doesn't hit the document handler and cause "No routes matched".
 * Redirect to the app logo so the tab gets an icon.
 */
export async function loader() {
  return redirect('/assets/logo/inventory-pic.png');
}

export default function FaviconRoute() {
  return null;
}
