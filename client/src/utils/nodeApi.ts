// Utility to fetch all node types from the backend
export async function fetchNodeTypes() {
  try {
    const response = await fetch("/api/node-types");
    if (!response.ok) throw new Error("Failed to fetch node types");
    return await response.json();
  } catch (error) {
    console.error("Error fetching node types:", error);
    return [];
  }
}
