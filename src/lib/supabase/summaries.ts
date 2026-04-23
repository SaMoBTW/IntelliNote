import type { SupabaseClient } from "@supabase/supabase-js";

export type SummaryRow = {
  id: string;
  user_id: string;
  document_id: string;
  key_points: string[];
  full_summary: string;
  word_count: number;
  created_at: string;
  updated_at: string;
};

export type SummaryListItem = SummaryRow & { document_title: string };

function parseKeyPoints(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string") {
    try {
      const j = JSON.parse(raw) as unknown;
      return Array.isArray(j) ? j.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

async function titlesForDocumentIds(
  supabase: SupabaseClient,
  ids: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (ids.length === 0) return map;
  const { data, error } = await supabase
    .from("documents")
    .select("id, title")
    .in("id", ids);
  if (error) throw error;
  for (const row of data ?? []) {
    map.set((row as { id: string }).id, (row as { title: string }).title);
  }
  return map;
}

export async function fetchSummariesList(
  supabase: SupabaseClient,
): Promise<SummaryListItem[]> {
  const { data: sums, error } = await supabase
    .from("summaries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  const rows = (sums ?? []) as Record<string, unknown>[];
  const docIds = [...new Set(rows.map((r) => r.document_id as string))];
  const titles = await titlesForDocumentIds(supabase, docIds);

  return rows.map((r) => {
    const s = r as unknown as SummaryRow;
    return {
      ...s,
      key_points: parseKeyPoints(r.key_points),
      document_title: titles.get(s.document_id) ?? "Document",
    };
  });
}

export async function fetchSummaryById(
  supabase: SupabaseClient,
  id: string,
): Promise<SummaryListItem | null> {
  const { data, error } = await supabase
    .from("summaries")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const r = data as Record<string, unknown>;
  const s = data as unknown as SummaryRow;
  const titles = await titlesForDocumentIds(supabase, [s.document_id]);
  return {
    ...s,
    key_points: parseKeyPoints(r.key_points),
    document_title: titles.get(s.document_id) ?? "Document",
  };
}

export async function insertSummary(
  supabase: SupabaseClient,
  input: {
    document_id: string;
    key_points: string[];
    full_summary: string;
    word_count: number;
  },
): Promise<SummaryRow> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const uid = userData.user?.id;
  if (!uid) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("summaries")
    .insert({
      user_id: uid,
      document_id: input.document_id,
      key_points: input.key_points,
      full_summary: input.full_summary,
      word_count: input.word_count,
    })
    .select()
    .single();

  if (error) throw error;
  const row = data as Record<string, unknown>;
  return {
    ...(data as unknown as SummaryRow),
    key_points: parseKeyPoints(row.key_points),
  };
}

export async function updateSummary(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<
    Pick<SummaryRow, "key_points" | "full_summary" | "word_count">
  >,
): Promise<void> {
  const { error } = await supabase
    .from("summaries")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteSummary(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("summaries").delete().eq("id", id);
  if (error) throw error;
}
