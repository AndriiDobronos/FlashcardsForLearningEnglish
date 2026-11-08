"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { loadCatalog, type Theme } from "@/lib/catalog";
import { seedCards, type Card } from "@/lib/data";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { loadActiveThemeIds, saveActiveThemeIds } from "@/lib/theme-preferences";

export default function SetsPage() {
  const [activeThemes, setActiveThemes] = useState<string[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [cards, setCards] = useState<Card[]>(seedCards);
  const [themeFilter, setThemeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [catalogError, setCatalogError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Card | null>(null);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleting, setDeleting] = useState(false);

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

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !userId) {
      setDeleteMessage("Увійдіть через email, щоб видаляти власні картки.");
      return;
    }
    setDeleting(true);
    const { error } = await supabase.from("cards").delete().eq("id", deleteCandidate.id).eq("created_by", userId);
    if (error) {
      setDeleteMessage(`Не вдалося видалити картку: ${error.message}`);
      setDeleting(false);
      return;
    }
    setCards((current) => current.filter((card) => card.id !== deleteCandidate.id));
    setDeleteCandidate(null);
    setDeleting(false);
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
        {userId && card.createdBy === userId && <div className="delete-zone"><button type="button" className="delete-card-button" aria-label={`Видалити картку ${card.en}`} onClick={(event) => requestDelete(event, card)}>×</button></div>}
        <div className="emoji">{card.emoji}</div><h3>{card.en}</h3><p>{card.uk}</p><small style={{ display: "block", marginTop: 16, color: "#6b7d77" }}>{card.themeLabel}</small>
      </div>)}
    </div>

    {deleteCandidate && <div className="modal-backdrop" role="presentation" onMouseDown={() => { if (!deleting) setDeleteCandidate(null); }}><div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title" onMouseDown={(event) => event.stopPropagation()}><h2 id="delete-title">Видалити власну картку?</h2><p>Картку «{deleteCandidate.en}» буде видалено з каталогу.</p>{deleteMessage && <p className="delete-error" role="alert">{deleteMessage}</p>}<div className="modal-actions"><button type="button" className="button secondary" onClick={() => setDeleteCandidate(null)} disabled={deleting}>Скасувати</button><button type="button" className="button danger" onClick={() => void confirmDelete()} disabled={deleting}>{deleting ? "Видаляю…" : "Так, видалити"}</button></div></div></div>}
  </div>;
}
