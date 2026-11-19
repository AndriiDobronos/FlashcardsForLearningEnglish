"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { loadArchivedCatalog, loadCatalog, type Theme } from "@/lib/catalog";
import { seedCards, type Card } from "@/lib/data";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { loadActiveThemeIds, saveActiveThemeIds } from "@/lib/theme-preferences";
import { isDuplicateCardError, normalizeEnglishText } from "@/lib/card-normalization";
import { loadAdminActions, loadAdminStatus, type AdminAction } from "@/lib/admin";

export default function SetsPage() {
  const [activeThemes, setActiveThemes] = useState<string[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [cards, setCards] = useState<Card[]>(seedCards);
  const [themeFilter, setThemeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [catalogError, setCatalogError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [archivedCards, setArchivedCards] = useState<Card[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [deleteCandidate, setDeleteCandidate] = useState<Card | null>(null);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [editCandidate, setEditCandidate] = useState<Card | null>(null);
  const [editForm, setEditForm] = useState({ en: "", uk: "", example: "", emoji: "" });
  const [editMessage, setEditMessage] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { themes: loadedThemes, cards: loadedCards, error } = await loadCatalog();
      setThemes(loadedThemes);
      setCards(loadedCards);
      setCatalogError(error ?? "");
      setActiveThemes(await loadActiveThemeIds(loadedThemes.map((theme) => theme.id)));
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data } = await supabase.auth.getUser();
        setUserId(data.user?.id ?? null);
        const admin = await loadAdminStatus();
        setIsAdmin(admin);
        if (admin) {
          setArchivedCards(await loadArchivedCatalog());
          setAdminActions(await loadAdminActions());
        }
      }
    };
    void load();
  }, []);

  const visibleCards = useMemo(() => cards.filter((card) =>
    (themeFilter === "all" || card.theme === themeFilter) &&
    `${card.en} ${card.uk} ${card.themeLabel}`.toLowerCase().includes(search.toLowerCase().trim()),
  ), [cards, themeFilter, search]);

  const toggleTheme = async (themeId: string) => {
    const next = activeThemes.includes(themeId)
      ? activeThemes.filter((id) => id !== themeId)
      : [...activeThemes, themeId];
    setActiveThemes(next);
    await saveActiveThemeIds(next);
  };

  const requestDelete = (event: MouseEvent<HTMLButtonElement>, card: Card) => {
    event.stopPropagation();
    setDeleteMessage("");
    setDeleteCandidate(card);
  };

  const requestEdit = (event: MouseEvent<HTMLButtonElement>, card: Card) => {
    event.stopPropagation();
    setEditCandidate(card);
    setEditForm({ en: card.en, uk: card.uk, example: card.example, emoji: card.emoji });
    setEditMessage("");
  };

  const saveEdit = async () => {
    if (!editCandidate || !userId) {
      setEditMessage("Увійдіть через email, щоб редагувати власні картки.");
      return;
    }
    const values = { en: editForm.en.trim().replace(/\s+/g, " "), uk: editForm.uk.trim(), example: editForm.example.trim(), emoji: editForm.emoji.trim() };
    if (!values.en || !values.uk || !values.example || !values.emoji) {
      setEditMessage("Заповніть усі поля.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setEditMessage("Supabase не підключено.");
      return;
    }
    setSavingEdit(true);
    const englishKey = normalizeEnglishText(values.en);
    const { data: duplicateCard, error: duplicateCheckError } = await supabase.from("cards").select("id,english_text").eq("english_key", englishKey).neq("id", editCandidate.id).limit(1).maybeSingle();
    if (duplicateCheckError) {
      setEditMessage(`Не вдалося перевірити дублювання: ${duplicateCheckError.message}`);
      setSavingEdit(false);
      return;
    }
    if (duplicateCard) {
      setEditMessage(`Така картка вже існує у словнику: «${duplicateCard.english_text}».`);
      setSavingEdit(false);
      return;
    }
    let updateQuery = supabase.from("cards").update({ english_text: values.en, ukrainian_text: values.uk, example_sentence: values.example, emoji: values.emoji }).eq("id", editCandidate.id);
    if (!isAdmin) updateQuery = updateQuery.eq("created_by", userId);
    const { error } = await updateQuery;
    if (error) {
      setEditMessage(isDuplicateCardError(error) ? "Така картка вже існує у словнику. Зміни не збережено." : `Не вдалося зберегти зміни: ${error.message}`);
      setSavingEdit(false);
      return;
    }
    setCards((current) => current.map((card) => card.id === editCandidate.id ? { ...card, en: values.en, uk: values.uk, example: values.example, emoji: values.emoji } : card));
    setEditCandidate(null);
    setSavingEdit(false);
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !userId) {
      setDeleteMessage("Увійдіть через email, щоб керувати картками.");
      return;
    }
    setDeleting(true);
    const archiveResult = isAdmin
      ? await supabase.rpc("admin_archive_card", { p_card_id: deleteCandidate.id })
      : await supabase.from("cards").update({ archived_at: new Date().toISOString() }).eq("id", deleteCandidate.id).eq("created_by", userId).select("id").maybeSingle();
    const archiveSucceeded = isAdmin ? archiveResult.data === true : Boolean(archiveResult.data);
    if (archiveResult.error || !archiveSucceeded) {
      setDeleteMessage(`Не вдалося прибрати картку: ${archiveResult.error?.message ?? "операцію відхилено"}`);
      setDeleting(false);
      return;
    }
    const archivedCard = { ...deleteCandidate, archivedAt: new Date().toISOString() };
    setCards((current) => current.filter((card) => card.id !== deleteCandidate.id));
    setArchivedCards((current) => [archivedCard, ...current]);
    setAdminActions(await loadAdminActions());
    setDeleteCandidate(null);
    setDeleting(false);
  };

  const restoreCard = async (card: Card) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !isAdmin) return;
    const { data: restored, error } = await supabase.rpc("admin_restore_card", { p_card_id: card.id });
    if (error || restored !== true) return;
    setArchivedCards((current) => current.filter((item) => item.id !== card.id));
    setCards((current) => [...current, { ...card, archivedAt: undefined }]);
    setAdminActions(await loadAdminActions());
  };

  return <div>
    <div className="eyebrow">Бібліотека</div>
    <h1>Налаштуй теми для навчання.</h1>
    <p style={{ maxWidth: 650 }}>Обери теми, які хочеш бачити в автоматичних сесіях. Конкретні картки та їхній порядок тепер визначає персональний планувальник.</p>
    {catalogError && <p role="alert" className="catalog-error">Не вдалося завантажити актуальний каталог: {catalogError}</p>}

    <div className="theme-grid theme-choice-grid">
      {themes.map((theme) => {
        const enabled = activeThemes.includes(theme.id);
        return <button type="button" className={`theme-card theme-choice${enabled ? " selected" : ""}`} key={theme.id} onClick={() => void toggleTheme(theme.id)}>
          <div className="emoji">{theme.emoji}</div>
          <h3>{theme.title}</h3>
          <p>{theme.description}</p>
          <small>{theme.cardCount} карток · {enabled ? "активна ✓" : "вимкнена"}</small>
        </button>;
      })}
    </div>

    <div className="section-row"><div><h2>Каталог карток</h2><p style={{ margin: 0 }}>Усього: <strong>{cards.length}</strong> карток</p></div><Link className="button secondary" href="/add-card">Додати слово</Link></div>
    <input className="catalog-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Пошук слова або перекладу…" aria-label="Пошук картки" />
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "18px 0" }}>
      <button className="button secondary" onClick={() => setThemeFilter("all")}>Усі теми</button>
      {themes.map((theme) => <button className="button secondary" key={theme.id} onClick={() => setThemeFilter(theme.id)}>{theme.emoji} {theme.title}</button>)}
    </div>
    <div className="theme-grid">
      {visibleCards.map((card) => <div className="theme-card" key={card.id}>
        {userId && (isAdmin || card.createdBy === userId) && <div className="card-tools"><button type="button" className="edit-card-button" aria-label={`Редагувати картку ${card.en}`} onClick={(event) => requestEdit(event, card)}>✎</button><button type="button" className="delete-card-button" aria-label={`Архівувати картку ${card.en}`} onClick={(event) => requestDelete(event, card)}>×</button></div>}
        <div className="emoji">{card.emoji}</div><h3>{card.en}</h3><p>{card.uk}</p><small style={{ display: "block", marginTop: 16, color: "#6b7d77" }}>{card.themeLabel}</small>
      </div>)}
    </div>

    {isAdmin && <section className="admin-panel panel">
      <div className="section-row"><div><div className="eyebrow">Адміністрування</div><h2>Архівні картки</h2><p style={{ margin: 0 }}>Їх не видно користувачам, але прогрес і історія збережені.</p></div></div>
      {archivedCards.length ? <div className="admin-list">{archivedCards.map((card) => <div className="admin-list-row" key={card.id}><span>{card.emoji} <strong>{card.en}</strong><small>{card.uk}</small></span><button type="button" className="button secondary" onClick={() => void restoreCard(card)}>Відновити</button></div>)}</div> : <p>Архів порожній.</p>}
      <div className="section-row admin-log-heading"><div><h2>Журнал дій</h2><p style={{ margin: 0 }}>Останні адміністративні операції.</p></div></div>
      {adminActions.length ? <div className="admin-list">{adminActions.map((item) => <div className="admin-list-row" key={item.id}><span>{item.action === "archive_card" ? "🗄️ Прибрано" : "↩️ Відновлено"} · {item.cardId ?? "картка недоступна"}</span><small>{new Date(item.createdAt).toLocaleString("uk-UA")}</small></div>)}</div> : <p>Дій ще не було.</p>}
    </section>}

    {deleteCandidate && <div className="modal-backdrop" role="presentation" onMouseDown={() => { if (!deleting) setDeleteCandidate(null); }}><div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title" onMouseDown={(event) => event.stopPropagation()}><h2 id="delete-title">Прибрати картку зі словника?</h2><p>Картка «{deleteCandidate.en}» зникне з каталогу. Прогрес користувачів і історія повторень залишаться збереженими.</p>{deleteMessage && <p className="delete-error" role="alert">{deleteMessage}</p>}<div className="modal-actions"><button type="button" className="button secondary" onClick={() => setDeleteCandidate(null)} disabled={deleting}>Скасувати</button><button type="button" className="button danger" onClick={() => void confirmDelete()} disabled={deleting}>{deleting ? "Прибираю…" : "Так, прибрати"}</button></div></div></div>}
    {editCandidate && <div className="modal-backdrop" role="presentation" onMouseDown={() => { if (!savingEdit) setEditCandidate(null); }}><div className="confirm-modal edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-title" onMouseDown={(event) => event.stopPropagation()}><h2 id="edit-title">Редагувати картку</h2><label htmlFor="edit-english">Англійський текст</label><input id="edit-english" value={editForm.en} onChange={(event) => setEditForm({ ...editForm, en: event.target.value })} /><label htmlFor="edit-ukrainian">Український переклад</label><input id="edit-ukrainian" value={editForm.uk} onChange={(event) => setEditForm({ ...editForm, uk: event.target.value })} /><label htmlFor="edit-example">Приклад речення</label><textarea id="edit-example" rows={3} value={editForm.example} onChange={(event) => setEditForm({ ...editForm, example: event.target.value })} /><label htmlFor="edit-emoji">Емоджі</label><input id="edit-emoji" value={editForm.emoji} onChange={(event) => setEditForm({ ...editForm, emoji: event.target.value })} maxLength={8} />{editMessage && <p className="delete-error" role="alert">{editMessage}</p>}<div className="modal-actions"><button type="button" className="button secondary" onClick={() => setEditCandidate(null)} disabled={savingEdit}>Скасувати</button><button type="button" className="button" onClick={() => void saveEdit()} disabled={savingEdit}>{savingEdit ? "Зберігаю…" : "Зберегти"}</button></div></div></div>}
  </div>;
}
