import { createClient } from "next-sanity";

let cachedClient: any = null;

export const client = (() => {
  if (cachedClient) return cachedClient;
  
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

  if (!projectId || !dataset) {
    // Return a dummy client during build if env vars aren't available
    return {
      fetch: async () => [],
    };
  }

  cachedClient = createClient({
    projectId,
    dataset,
    apiVersion: "2025-09-15",
    useCdn: true,
  });

  return cachedClient;
})();
