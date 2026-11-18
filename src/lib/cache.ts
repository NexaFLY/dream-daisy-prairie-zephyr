/**
 * CDN caching for public, user-independent pages. Browsers always revalidate,
 * while Netlify's edge serves a cached copy (refreshed in the background) so
 * visitors skip the server render. A new deploy invalidates the cache.
 */
export const publicPageHeaders = (sMaxAge = 300) => () => ({
  "Cache-Control": "public, max-age=0, must-revalidate",
  "Netlify-CDN-Cache-Control": `public, durable, s-maxage=${sMaxAge}, stale-while-revalidate=86400`,
});
