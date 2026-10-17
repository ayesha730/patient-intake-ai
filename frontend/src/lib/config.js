// Development uses the backend on port 3001. The live app uses the same address as the page.
export const API_BASE = import.meta.env.DEV ? "http://localhost:3001" : "";