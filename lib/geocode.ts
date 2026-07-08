export interface GeocodeResult {
  lat: number;
  lon: number;
  displayName: string;
}

interface OpenWeatherGeocodeResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

interface GoogleGeocodeResponse {
  results?: Array<{
    formatted_address: string;
    address_components?: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }>;
  status: string;
  error_message?: string;
}

interface SimplifiedQueries {
  primary: string;
  fallback: string | null;
}

function isCountry(part: string): boolean {
  return /^(USA|US|United States)$/i.test(part);
}

function isStreetAddress(part: string): boolean {
  return (
    /^\d+\s/.test(part) ||
    /\b(st|street|ave|avenue|blvd|boulevard|rd|road|dr|drive|ln|lane|way|ct|court|hwy|highway)\b/i.test(
      part
    )
  );
}

function parseState(part: string): string | null {
  const match = part.match(/^([A-Z]{2})(?:\s+\d{5}(?:-\d{4})?)?$/i);
  return match ? match[1].toUpperCase() : null;
}

export function simplifyLocation(location: string): SimplifiedQueries {
  const parts = location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    return { primary: location, fallback: null };
  }

  const working = [...parts];
  if (working.length > 1 && isCountry(working[working.length - 1])) {
    working.pop();
  }

  let stateIndex = -1;
  let state = "";

  for (let i = working.length - 1; i >= 0; i--) {
    const parsedState = parseState(working[i]);
    if (parsedState) {
      stateIndex = i;
      state = parsedState;
      break;
    }
  }

  if (stateIndex === -1 && working.length >= 2) {
    const lastPart = working[working.length - 1];
    if (/^[A-Z]{2}$/i.test(lastPart)) {
      stateIndex = working.length - 1;
      state = lastPart.toUpperCase();
    }
  }

  if (stateIndex > 0) {
    const city = working[stateIndex - 1];
    const beforeCity = working.slice(0, stateIndex - 1);
    const place =
      beforeCity.find((part) => !isStreetAddress(part)) ?? beforeCity[0];

    const fallback = `${city}, ${state}`;
    const primary =
      place && place !== city ? `${place}, ${city}, ${state}` : fallback;

    return {
      primary,
      fallback: primary !== fallback ? fallback : null,
    };
  }

  if (working.length >= 2) {
    const place = working.find((part) => !isStreetAddress(part)) ?? working[0];
    const city = working.find(
      (part, index) => index > 0 && part !== place && !isStreetAddress(part)
    );

    if (place && city) {
      return {
        primary: `${place}, ${city}`,
        fallback: city,
      };
    }
  }

  const nonStreetParts = working.filter((part) => !isStreetAddress(part));
  const primary = nonStreetParts[0] ?? working[0];

  return {
    primary,
    fallback: nonStreetParts.length > 1 ? nonStreetParts[1] : null,
  };
}

function buildOpenWeatherGeocodeUrl(location: string, apiKey: string): string {
  const params = new URLSearchParams({
    q: location,
    limit: "1",
    appid: apiKey,
  });

  return `https://api.openweathermap.org/geo/1.0/direct?${params}`;
}

function buildGoogleGeocodeUrl(location: string, apiKey: string): string {
  const params = new URLSearchParams({
    address: location,
    key: apiKey,
  });

  return `https://maps.googleapis.com/maps/api/geocode/json?${params}`;
}

function redactApiKey(url: string, apiKey: string): string {
  return url.replaceAll(apiKey, "[REDACTED]");
}

function uniqueQueries(...queries: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();

  return queries.filter((query): query is string => {
    if (!query || seen.has(query)) {
      return false;
    }

    seen.add(query);
    return true;
  });
}

async function queryOpenWeatherGeocodeApi(
  query: string,
  apiKey: string
): Promise<GeocodeResult | null> {
  const url = buildOpenWeatherGeocodeUrl(query, apiKey);
  console.error("[geocode:openweather] Request URL:", redactApiKey(url, apiKey));
  console.error("[geocode:openweather] Location query:", query);

  const response = await fetch(url);
  const responseText = await response.text();

  console.error("[geocode:openweather] Response status:", response.status);
  console.error("[geocode:openweather] Response body:", responseText);

  if (!response.ok) {
    console.error(
      `[geocode:openweather] API request failed for "${query}" with status ${response.status}`
    );
    return null;
  }

  let data: OpenWeatherGeocodeResult[];
  try {
    data = JSON.parse(responseText) as OpenWeatherGeocodeResult[];
  } catch (parseError) {
    console.error(
      "[geocode:openweather] Failed to parse response JSON:",
      parseError
    );
    return null;
  }

  if (!Array.isArray(data)) {
    console.error(
      "[geocode:openweather] Unexpected response shape (expected array):",
      data
    );
    return null;
  }

  if (!data.length) {
    console.error(
      `[geocode:openweather] No results returned for location: "${query}"`
    );
    return null;
  }

  const result = data[0];

  return {
    lat: result.lat,
    lon: result.lon,
    displayName: result.name,
  };
}

function extractGoogleLocality(
  components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>
): string | null {
  const findType = (...types: string[]) =>
    components.find((component) =>
      types.some((type) => component.types.includes(type))
    );

  return (
    findType("locality")?.long_name ??
    findType("postal_town")?.long_name ??
    findType("sublocality", "sublocality_level_1")?.long_name ??
    findType("administrative_area_level_2")?.long_name ??
    null
  );
}

async function queryGoogleGeocodeApi(
  query: string,
  apiKey: string
): Promise<GeocodeResult | null> {
  const url = buildGoogleGeocodeUrl(query, apiKey);
  console.error("[geocode:google] Request URL:", redactApiKey(url, apiKey));
  console.error("[geocode:google] Location query:", query);

  const response = await fetch(url);
  const responseText = await response.text();

  console.error("[geocode:google] Response status:", response.status);
  console.error("[geocode:google] Response body:", responseText);

  if (!response.ok) {
    console.error(
      `[geocode:google] API request failed for "${query}" with status ${response.status}`
    );
    return null;
  }

  let data: GoogleGeocodeResponse;
  try {
    data = JSON.parse(responseText) as GoogleGeocodeResponse;
  } catch (parseError) {
    console.error("[geocode:google] Failed to parse response JSON:", parseError);
    return null;
  }

  if (data.status !== "OK") {
    console.error(
      `[geocode:google] No results for "${query}" (status: ${data.status})${
        data.error_message ? ` — ${data.error_message}` : ""
      }`
    );
    return null;
  }

  const result = data.results?.[0];
  if (!result) {
    console.error(`[geocode:google] Empty results array for "${query}"`);
    return null;
  }

  const cityName =
    extractGoogleLocality(result.address_components ?? []) ??
    result.formatted_address.split(",")[0]?.trim() ??
    result.formatted_address;

  return {
    lat: result.geometry.location.lat,
    lon: result.geometry.location.lng,
    displayName: cityName,
  };
}

export async function geocodeLocation(
  location: string
): Promise<GeocodeResult | null> {
  const openWeatherKey = process.env.OPENWEATHER_KEY;
  const googleApiKey = process.env.GOOGLE_API_KEY;

  const { primary, fallback } = simplifyLocation(location);
  console.error("[geocode] Original location:", location);
  console.error("[geocode] Simplified primary query:", primary);
  if (fallback) {
    console.error("[geocode] Simplified fallback query:", fallback);
  }

  const openWeatherQueries = uniqueQueries(primary, fallback);
  const googleQueries = uniqueQueries(location, primary, fallback);

  try {
    if (openWeatherKey) {
      for (const query of openWeatherQueries) {
        const result = await queryOpenWeatherGeocodeApi(query, openWeatherKey);
        if (result) {
          return result;
        }
      }
    } else {
      console.error(
        "[geocode] OPENWEATHER_KEY is not set, skipping OpenWeather geocoding"
      );
    }

    if (!googleApiKey) {
      console.error(
        "[geocode] GOOGLE_API_KEY is not set, cannot use Google fallback"
      );
      return null;
    }

    console.error("[geocode] Falling back to Google Maps Geocoding API");

    for (const query of googleQueries) {
      const result = await queryGoogleGeocodeApi(query, googleApiKey);
      if (result) {
        return result;
      }
    }

    return null;
  } catch (error) {
    console.error(`[geocode] Request failed for "${location}":`, error);
    return null;
  }
}
