import { prisma } from "@/lib/prisma";
import { decryptCredentials } from "@/lib/crypto";

export interface GoogleMapsConfig {
  api_key: string;
  enable_places: boolean;
  enable_geocoding: boolean;
  is_active: boolean;
}

export const DEFAULT_GOOGLE_MAPS_CONFIG: GoogleMapsConfig = {
  api_key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || process.env.GOOGLE_MAPS_API_KEY || "",
  enable_places: true,
  enable_geocoding: true,
  is_active: false,
};

export async function getGoogleMapsConfig(): Promise<GoogleMapsConfig> {
  try {
    const row = await prisma.integrationCredential.findUnique({
      where: { service_slug: "google-maps" },
    });
    if (!row || !row.credentials) return DEFAULT_GOOGLE_MAPS_CONFIG;

    const creds = decryptCredentials(row.credentials as Record<string, unknown>);
    return {
      api_key: (creds.api_key as string) || DEFAULT_GOOGLE_MAPS_CONFIG.api_key,
      enable_places: creds.enable_places !== false,
      enable_geocoding: creds.enable_geocoding !== false,
      is_active: row.is_active,
    };
  } catch (e) {
    console.error("Failed to load Google Maps config:", e);
    return DEFAULT_GOOGLE_MAPS_CONFIG;
  }
}

/**
 * Validates a Google Maps API Key by making a lightweight geocoding request
 */
export async function testGoogleMapsApiKey(apiKey: string): Promise<{ ok: boolean; error?: string }> {
  if (!apiKey || apiKey.length < 10) {
    throw new Error("Invalid Google Maps API Key. Key must be non-empty and at least 10 characters.");
  }

  // If mock/placeholder
  if (apiKey.includes("placeholder") || apiKey.startsWith("mock_")) {
    return { ok: true };
  }

  try {
    const testAddress = "Udaipur, Rajasthan, India";
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      testAddress
    )}&key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status === "REQUEST_DENIED") {
      throw new Error(`Google Maps API error: ${data.error_message || "API key is invalid or lacks Geocoding API permissions."}`);
    }

    if (data.status === "OK" || data.status === "ZERO_RESULTS") {
      return { ok: true };
    }

    throw new Error(`Google Maps API responded with status: ${data.status}`);
  } catch (err: any) {
    console.error("Google Maps API test error:", err);
    throw err;
  }
}
