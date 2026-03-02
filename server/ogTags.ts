const BASE_URL = "https://verde.replit.app";

export function injectOgTags(html: string, lat: number, lng: number): string {
  const latStr = lat.toFixed(4);
  const lngStr = lng.toFixed(4);
  const pageUrl = `${BASE_URL}?lat=${latStr}&lng=${lngStr}`;
  const imageUrl = `${BASE_URL}/api/og-image?lat=${latStr}&lng=${lngStr}`;
  const title = `Verde - Environmental Score for ${latStr}, ${lngStr}`;

  let result = html;

  // Replace og:title
  result = result.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${title}" />`,
  );

  // Replace og:image (static fallback → dynamic)
  result = result.replace(
    /<meta property="og:image" content="[^"]*" \/>/,
    `<meta property="og:image" content="${imageUrl}" />`,
  );

  // Replace twitter:image
  result = result.replace(
    /<meta name="twitter:image" content="[^"]*" \/>/,
    `<meta name="twitter:image" content="${imageUrl}" />`,
  );

  // Replace twitter:title
  result = result.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${title}" />`,
  );

  // Replace og:url
  result = result.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${pageUrl}" />`,
  );

  return result;
}
