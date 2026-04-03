export const PARA_DEV_KEY_EVENT = "para:request-dev-key";

const SESSION_ID_HEADER = "X-Session-Id";
const API_KEY_HEADER = "X-API-Key";

export function hasParaAuthorization(applications: string[]): boolean {
  return applications.some((application) => application.trim().toLowerCase() === "para");
}

export async function fetchAuthorizedApplicationsForApiKey(
  backendUrl: string,
  sessionId: string,
  apiKey: string,
): Promise<string[]> {
  const response = await fetch(new URL("/api/control/applications", backendUrl), {
    headers: {
      [SESSION_ID_HEADER]: sessionId,
      [API_KEY_HEADER]: apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to validate API key: HTTP ${response.status}`);
  }

  return (await response.json()) as string[];
}

export function requestParaDevKey(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PARA_DEV_KEY_EVENT));
}
