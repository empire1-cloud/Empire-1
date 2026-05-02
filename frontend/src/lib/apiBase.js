const normalizeBase = (value) => (value || "").trim().replace(/\/+$/, "");

const getHostRoutedApiBase = (host) => {
  if (host === "lyrica3.com" || host === "www.lyrica3.com") {
    return "https://api.lyrica3.com";
  }

  if (host === "empire1.cloud" || host === "www.empire1.cloud") {
    return "https://api.empire1.cloud";
  }

  return null;
};

const shouldIgnoreEnvBase = (envBase) => {
  if (typeof window === "undefined") return false;

  try {
    const envHost = new URL(envBase).hostname.toLowerCase();
    const pageHost = window.location.hostname.toLowerCase();

    // Guard against stale deployments hardcoded to old Southern API host.
    return envHost === "api.southernlifestyle.org" && pageHost.includes("lyrica3");
  } catch {
    return false;
  }
};

export const getApiBase = () => {
  const envBase = normalizeBase(process.env.REACT_APP_BACKEND_URL);
  if (envBase && !shouldIgnoreEnvBase(envBase)) {
    return envBase;
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();

    const routedApiBase = getHostRoutedApiBase(host);
    if (routedApiBase) {
      return routedApiBase;
    }

    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:8000";
    }
    return window.location.origin;
  }

  return "http://localhost:8000";
};

export const API_BASE = getApiBase();
export const API_V1 = `${API_BASE}/api`;
export const WS_BASE = API_BASE.replace(/^https:/, "wss:").replace(/^http:/, "ws:");
