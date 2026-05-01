function normalizeApiOrigin(value) {
  if (!value) {
    return "";
  }

  return value.replace(/\/api\/?$/, "").replace(/\/$/, "");
}

function getApiRoots() {
  const configuredOrigins = String(process.env.NEXT_PUBLIC_API_URL || "")
    .split(",")
    .map((value) => normalizeApiOrigin(value.trim()))
    .filter(Boolean);

  return configuredOrigins
    .filter((origin, index, arr) => arr.indexOf(origin) === index)
    .map((origin) => `${origin}/api`);
}

const API_ROOTS = getApiRoots();
const API_ROOT = API_ROOTS[0] || "";

export async function apiRequest(path, options = {}) {
  if (!API_ROOTS.length) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  let lastError = null;

  for (let index = 0; index < API_ROOTS.length; index += 1) {
    const apiRoot = API_ROOTS[index];

    try {
      const res = await fetch(`${apiRoot}${path}`, {
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        ...options,
      });

      let data;
      try {
        data = await res.json();
      } catch (_error) {
        data = null;
      }

      if (!res.ok) {
        const message = data?.error || "Request failed";
        throw new Error(message);
      }

      return data;
    } catch (error) {
      const isNetworkError = error instanceof TypeError;
      const hasFallback = index < API_ROOTS.length - 1;

      if (!isNetworkError || !hasFallback) {
        throw error;
      }

      lastError = error;
    }
  }

  throw lastError || new Error("Request failed");
}

export { API_ROOT };
