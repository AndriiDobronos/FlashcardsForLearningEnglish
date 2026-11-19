-- Physical DELETE is intentionally disabled.
-- Cards are archived by updating archived_at so user progress and review history remain intact.
revoke delete on table public.cards from authenticated;
