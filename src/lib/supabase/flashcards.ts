import type { SupabaseClient } from "@supabase/supabase-js";

export type FlashcardDeckRow = {
  id: string;
  user_id: string;
  document_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
};

export type FlashcardRow = {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  sort_order: number;
  created_at: string;
};

export type DeckListItem = FlashcardDeckRow & {
  document_title: string | null;
  cards_count: number;
};

export async function fetchDecksList(
  supabase: SupabaseClient,
): Promise<DeckListItem[]> {
  const { data: decks, error: deckErr } = await supabase
    .from("flashcard_decks")
    .select("*")
    .order("created_at", { ascending: false });

  if (deckErr) throw deckErr;

  const docIds = [
    ...new Set(
      (decks ?? [])
        .map((d: Record<string, unknown>) => d.document_id as string | null)
        .filter(Boolean) as string[],
    ),
  ];
  const titleMap = new Map<string, string>();
  if (docIds.length > 0) {
    const { data: docs, error: docErr } = await supabase
      .from("documents")
      .select("id, title")
      .in("id", docIds);
    if (docErr) throw docErr;
    for (const row of docs ?? []) {
      titleMap.set(
        (row as { id: string }).id,
        (row as { title: string }).title,
      );
    }
  }

  const { data: counts, error: countErr } = await supabase
    .from("flashcards")
    .select("deck_id");

  if (countErr) throw countErr;

  const byDeck = new Map<string, number>();
  for (const row of counts ?? []) {
    const id = (row as { deck_id: string }).deck_id;
    byDeck.set(id, (byDeck.get(id) ?? 0) + 1);
  }

  return (decks ?? []).map((raw: Record<string, unknown>) => {
    const d = raw as unknown as FlashcardDeckRow;
    return {
      ...d,
      document_title: d.document_id
        ? titleMap.get(d.document_id) ?? null
        : null,
      cards_count: byDeck.get(d.id) ?? 0,
    };
  });
}

export async function insertDeck(
  supabase: SupabaseClient,
  input: { title: string; document_id?: string | null },
): Promise<FlashcardDeckRow> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const uid = userData.user?.id;
  if (!uid) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("flashcard_decks")
    .insert({
      user_id: uid,
      title: input.title,
      document_id: input.document_id ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as FlashcardDeckRow;
}

export async function deleteDeck(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("flashcard_decks").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchCardsForDeck(
  supabase: SupabaseClient,
  deckId: string,
): Promise<FlashcardRow[]> {
  const { data, error } = await supabase
    .from("flashcards")
    .select("*")
    .eq("deck_id", deckId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as FlashcardRow[];
}

export async function insertFlashcard(
  supabase: SupabaseClient,
  input: { deck_id: string; front: string; back: string; sort_order?: number },
): Promise<FlashcardRow> {
  const { data, error } = await supabase
    .from("flashcards")
    .insert({
      deck_id: input.deck_id,
      front: input.front,
      back: input.back,
      sort_order: input.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data as FlashcardRow;
}
