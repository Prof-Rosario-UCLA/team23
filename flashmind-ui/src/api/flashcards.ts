export async function generateDummy(notes: string) {
  const res = await fetch("/api/generate/dummy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
  });
  const data = await res.json();
  if (!res.ok || !Array.isArray(data.cards)) {
    throw new Error(data.error ?? "Failed to fetch dummy flashcards");
  }
  return data.cards as { front: string; back: string }[];
}

export async function generate(notes: string) {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
  });
  const data = await res.json();
  if (!res.ok || !Array.isArray(data.cards)) {
    throw new Error(data.error ?? "Failed to fetch dummy flashcards");
  }
  return data.cards as { front: string; back: string }[];
}