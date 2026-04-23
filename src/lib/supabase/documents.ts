import type { SupabaseClient } from "@supabase/supabase-js";

export type DocumentRow = {
  id: string;
  user_id: string;
  title: string;
  type: string;
  processed: boolean;
  body_text: string | null;
  progress: number;
  last_opened_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function fetchDocuments(
  supabase: SupabaseClient,
): Promise<DocumentRow[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as DocumentRow[];
}

export async function fetchDocumentById(
  supabase: SupabaseClient,
  id: string,
): Promise<DocumentRow | null> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as DocumentRow) ?? null;
}

export async function insertDocument(
  supabase: SupabaseClient,
  row: Pick<DocumentRow, "title" | "type" | "processed"> & {
    body_text?: string | null;
  },
): Promise<DocumentRow> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const uid = userData.user?.id;
  if (!uid) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: uid,
      title: row.title,
      type: row.type,
      processed: row.processed,
      body_text: row.body_text ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as DocumentRow;
}

export async function updateDocument(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<
    Pick<DocumentRow, "title" | "type" | "processed" | "body_text" | "progress">
  >,
): Promise<void> {
  const { error } = await supabase
    .from("documents")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function touchDocumentOpened(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("documents")
    .update({
      last_opened_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteDocument(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw error;
}
