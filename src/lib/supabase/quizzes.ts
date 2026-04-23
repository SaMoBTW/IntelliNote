import type { SupabaseClient } from "@supabase/supabase-js";

export type QuizRow = {
  id: string;
  user_id: string;
  document_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
};

export type QuizQuestionRow = {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
  sort_order: number;
  created_at: string;
};

export type QuizListItem = QuizRow & {
  document_title: string | null;
  questions_count: number;
  completed: boolean;
  score?: number;
  last_attempt_at: string | null;
};

export async function fetchQuizzesList(
  supabase: SupabaseClient,
): Promise<QuizListItem[]> {
  const { data: quizzes, error: qErr } = await supabase
    .from("quizzes")
    .select("*")
    .order("created_at", { ascending: false });

  if (qErr) throw qErr;

  const docIds = [
    ...new Set(
      (quizzes ?? [])
        .map((q: Record<string, unknown>) => q.document_id as string | null)
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

  const { data: qCounts, error: cErr } = await supabase
    .from("quiz_questions")
    .select("quiz_id");

  if (cErr) throw cErr;

  const countByQuiz = new Map<string, number>();
  for (const row of qCounts ?? []) {
    const id = (row as { quiz_id: string }).quiz_id;
    countByQuiz.set(id, (countByQuiz.get(id) ?? 0) + 1);
  }

  const { data: attempts, error: aErr } = await supabase
    .from("quiz_attempts")
    .select("quiz_id, score_pct, created_at")
    .order("created_at", { ascending: false });

  if (aErr) throw aErr;

  const bestAttempt = new Map<
    string,
    { score_pct: number; created_at: string }
  >();
  for (const row of attempts ?? []) {
    const r = row as {
      quiz_id: string;
      score_pct: number;
      created_at: string;
    };
    if (!bestAttempt.has(r.quiz_id)) {
      bestAttempt.set(r.quiz_id, {
        score_pct: r.score_pct,
        created_at: r.created_at,
      });
    }
  }

  return (quizzes ?? []).map((raw: Record<string, unknown>) => {
    const q = raw as unknown as QuizRow;
    const att = bestAttempt.get(q.id);
    return {
      ...q,
      document_title: q.document_id
        ? titleMap.get(q.document_id) ?? null
        : null,
      questions_count: countByQuiz.get(q.id) ?? 0,
      completed: att !== undefined,
      score: att?.score_pct,
      last_attempt_at: att?.created_at ?? null,
    };
  });
}

export async function insertQuiz(
  supabase: SupabaseClient,
  input: { title: string; document_id?: string | null },
): Promise<QuizRow> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const uid = userData.user?.id;
  if (!uid) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("quizzes")
    .insert({
      user_id: uid,
      title: input.title,
      document_id: input.document_id ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as QuizRow;
}

export async function deleteQuiz(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("quizzes").delete().eq("id", id);
  if (error) throw error;
}

function parseOptions(raw: unknown): string[] {
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

export async function fetchQuestionsForQuiz(
  supabase: SupabaseClient,
  quizId: string,
): Promise<QuizQuestionRow[]> {
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => ({
    ...(row as unknown as QuizQuestionRow),
    options: parseOptions(row.options),
  }));
}

export async function insertQuizQuestion(
  supabase: SupabaseClient,
  input: {
    quiz_id: string;
    question: string;
    options: string[];
    correct_index: number;
    explanation?: string | null;
    sort_order?: number;
  },
): Promise<QuizQuestionRow> {
  const { data, error } = await supabase
    .from("quiz_questions")
    .insert({
      quiz_id: input.quiz_id,
      question: input.question,
      options: input.options,
      correct_index: input.correct_index,
      explanation: input.explanation ?? null,
      sort_order: input.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) throw error;
  const row = data as Record<string, unknown>;
  return {
    ...(data as unknown as QuizQuestionRow),
    options: parseOptions(row.options),
  };
}

export async function insertQuizAttempt(
  supabase: SupabaseClient,
  quizId: string,
  scorePct: number,
): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const uid = userData.user?.id;
  if (!uid) throw new Error("Not signed in");

  const { error } = await supabase.from("quiz_attempts").insert({
    user_id: uid,
    quiz_id: quizId,
    score_pct: scorePct,
  });

  if (error) throw error;
}

export async function fetchDashboardStats(supabase: SupabaseClient): Promise<{
  documentCount: number;
  summaryCount: number;
  flashcardCount: number;
  avgQuizScore: number | null;
}> {
  const [docs, sums, cards, attempts] = await Promise.all([
    supabase.from("documents").select("id", { count: "exact", head: true }),
    supabase.from("summaries").select("id", { count: "exact", head: true }),
    supabase.from("flashcards").select("id", { count: "exact", head: true }),
    supabase.from("quiz_attempts").select("score_pct"),
  ]);

  if (docs.error) throw docs.error;
  if (sums.error) throw sums.error;
  if (cards.error) throw cards.error;
  if (attempts.error) throw attempts.error;

  const scores = (attempts.data ?? []) as { score_pct: number }[];
  const avg =
    scores.length > 0
      ? Math.round(
          scores.reduce((a, b) => a + b.score_pct, 0) / scores.length,
        )
      : null;

  return {
    documentCount: docs.count ?? 0,
    summaryCount: sums.count ?? 0,
    flashcardCount: cards.count ?? 0,
    avgQuizScore: avg,
  };
}
