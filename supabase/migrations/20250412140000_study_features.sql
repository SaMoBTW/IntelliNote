-- Extends documents for study content; adds summaries, flashcards, quizzes (all RLS-scoped per user).
-- Run after 20250412120000_create_documents.sql

alter table public.documents
  add column if not exists body_text text,
  add column if not exists progress smallint not null default 0
    check (progress >= 0 and progress <= 100),
  add column if not exists last_opened_at timestamptz;

-- --- Summaries ---
create table if not exists public.summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  document_id uuid not null references public.documents (id) on delete cascade,
  key_points jsonb not null default '[]'::jsonb,
  full_summary text not null default '',
  word_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists summaries_user_id_idx on public.summaries (user_id);
create index if not exists summaries_document_id_idx on public.summaries (document_id);

alter table public.summaries enable row level security;

create policy "summaries_select_own"
  on public.summaries for select
  using (auth.uid() = user_id);

create policy "summaries_insert_own"
  on public.summaries for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.documents d
      where d.id = document_id and d.user_id = auth.uid()
    )
  );

create policy "summaries_update_own"
  on public.summaries for update
  using (auth.uid() = user_id);

create policy "summaries_delete_own"
  on public.summaries for delete
  using (auth.uid() = user_id);

-- --- Flashcard decks & cards ---
create table if not exists public.flashcard_decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  document_id uuid references public.documents (id) on delete set null,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.flashcard_decks (id) on delete cascade,
  front text not null,
  back text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists flashcard_decks_user_id_idx on public.flashcard_decks (user_id);
create index if not exists flashcards_deck_id_idx on public.flashcards (deck_id);

alter table public.flashcard_decks enable row level security;
alter table public.flashcards enable row level security;

create policy "flashcard_decks_select_own"
  on public.flashcard_decks for select
  using (auth.uid() = user_id);

create policy "flashcard_decks_insert_own"
  on public.flashcard_decks for insert
  with check (auth.uid() = user_id);

create policy "flashcard_decks_update_own"
  on public.flashcard_decks for update
  using (auth.uid() = user_id);

create policy "flashcard_decks_delete_own"
  on public.flashcard_decks for delete
  using (auth.uid() = user_id);

create policy "flashcards_select_via_deck"
  on public.flashcards for select
  using (
    exists (
      select 1 from public.flashcard_decks d
      where d.id = deck_id and d.user_id = auth.uid()
    )
  );

create policy "flashcards_insert_via_deck"
  on public.flashcards for insert
  with check (
    exists (
      select 1 from public.flashcard_decks d
      where d.id = deck_id and d.user_id = auth.uid()
    )
  );

create policy "flashcards_update_via_deck"
  on public.flashcards for update
  using (
    exists (
      select 1 from public.flashcard_decks d
      where d.id = deck_id and d.user_id = auth.uid()
    )
  );

create policy "flashcards_delete_via_deck"
  on public.flashcards for delete
  using (
    exists (
      select 1 from public.flashcard_decks d
      where d.id = deck_id and d.user_id = auth.uid()
    )
  );

-- --- Quizzes ---
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  document_id uuid references public.documents (id) on delete set null,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  question text not null,
  options jsonb not null default '[]'::jsonb,
  correct_index int not null default 0,
  explanation text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  score_pct int not null check (score_pct >= 0 and score_pct <= 100),
  created_at timestamptz not null default now()
);

create index if not exists quizzes_user_id_idx on public.quizzes (user_id);
create index if not exists quiz_questions_quiz_id_idx on public.quiz_questions (quiz_id);
create index if not exists quiz_attempts_user_id_idx on public.quiz_attempts (user_id);

alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;

create policy "quizzes_select_own"
  on public.quizzes for select
  using (auth.uid() = user_id);

create policy "quizzes_insert_own"
  on public.quizzes for insert
  with check (auth.uid() = user_id);

create policy "quizzes_update_own"
  on public.quizzes for update
  using (auth.uid() = user_id);

create policy "quizzes_delete_own"
  on public.quizzes for delete
  using (auth.uid() = user_id);

create policy "quiz_questions_select_via_quiz"
  on public.quiz_questions for select
  using (
    exists (
      select 1 from public.quizzes q
      where q.id = quiz_id and q.user_id = auth.uid()
    )
  );

create policy "quiz_questions_insert_via_quiz"
  on public.quiz_questions for insert
  with check (
    exists (
      select 1 from public.quizzes q
      where q.id = quiz_id and q.user_id = auth.uid()
    )
  );

create policy "quiz_questions_update_via_quiz"
  on public.quiz_questions for update
  using (
    exists (
      select 1 from public.quizzes q
      where q.id = quiz_id and q.user_id = auth.uid()
    )
  );

create policy "quiz_questions_delete_via_quiz"
  on public.quiz_questions for delete
  using (
    exists (
      select 1 from public.quizzes q
      where q.id = quiz_id and q.user_id = auth.uid()
    )
  );

create policy "quiz_attempts_select_own"
  on public.quiz_attempts for select
  using (auth.uid() = user_id);

create policy "quiz_attempts_insert_own"
  on public.quiz_attempts for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.quizzes q
      where q.id = quiz_id and q.user_id = auth.uid()
    )
  );
