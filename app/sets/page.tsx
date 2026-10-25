"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type KeyboardEvent, type MouseEvent } from "react";
import { loadCatalog, type Theme } from "@/lib/catalog";
import { seedCards, type Card } from "@/lib/data";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const SELECTED_KEY = "wordly-selected-cards-v1";

export default function SetsPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [cards, setCards] = useState<Card[]>(seedCards);
  const [themeFilter, setThemeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [catalogError, setCatalogError] = useState("");
  const [deleteCandidate, setDeleteCandidate] = useState<Card | null>(null);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    try {
      setSelected(JSON.parse(localStorage.getItem(SELECTED_KEY) ?? "[]"));
    } catch {
      setSelected([]);
    }
    loadCatalog().then(({ themes: loadedThemes, cards: loadedCards, error }) => {
      setThemes(loadedThemes);
      setCards(loadedCards);
      setCatalogError(error ?? "");
    });
  }, []);

  const visibleCards = useMemo(() => cards.filter((card) =>
    (themeFilter === "all" || card.theme === themeFilter) &&
    `${card.en} ${card.uk} ${card.themeLabel}`.toLowerCase().includes(search.toLowerCase().trim()),
  ), [cards, themeFilter, search]);

  const toggle = (id: string) => {
    const next = selected.includes(id)
      ? selected.filter((item) => item !== id)
      : selected.length < 30 ? [...selected, id] : selected;
    setSelected(next);
    localStorage.setItem(SELECTED_KEY, JSON.stringify(next));
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>, id: string) => {
    if (event.target !== event.currentTarget || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    toggle(id);
  };

  const requestDelete = (event: MouseEvent<HTMLButtonElement>, card: Card) => {
    event.stopPropagation();
    setDeleteMessage("");
    setDeleteCandidate(card);
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setDeleteMessage("Supabase не підключено. Перевірте змінні середовища.");
      return;
    }
    setDeleting(true);
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setDeleteMessage("Увійдіть через email, щоб видаляти картки з каталогу.");
      setDeleting(false);
      return;
    }
    const { error } = await supabase.from("cards").delete().eq("id", deleteCandidate.id);
    if (error) {
      setDeleteMessage(`Не вдалося видалити картку: ${error.message}`);
      setDeleting(false);
      return;
    }
    const deletedId = deleteCandidate.id;
    setCards((current) => current.filter((card) => card.id !== deletedId));
    const nextSelected = selected.filter((id) => id !== deletedId);
    setSelected(nextSelected);
    localStorage.setItem(SELECTED_KEY, JSON.stringify(nextSelected));
    setDeleteCandidate(null);
    setDeleting(false);
  };

  return (
    <div>
      <div className="eyebrow">Бібліотека</div>
      <h1>Обери 30 карток для навчання.</h1>
      <p style={{ maxWidth: 620 }}>Обирай окремі слова та фрази. Натисни на картку, щоб додати або прибрати її з навчальної сесії.</p>
      <p className="catalog-count">У каталозі: <strong>{cards.length}</strong> карток · Для сесії потрібно обрати: <strong>30</strong></p>
      {catalogError && <p role="alert" className="catalog-error">Не вдалося завантажити актуальний каталог: {catalogError}</p>}
      <input className="catalog-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Пошук слова або перекладу…" aria-label="Пошук картки" />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "24px 0" }}>
        <button className="button secondary" onClick={() => setThemeFilter("all")}>Усі теми</button>
        {themes.map((theme) => <button className="button secondary" key={theme.id} onClick={() => setThemeFilter(theme.id)}>{theme.emoji} {theme.title}</button>)}
      </div>
      <div className="theme-grid">
        {visibleCards.map((card) => {
          const isSelected = selected.includes(card.id);
          return (
            <div className={`theme-card${isSelected ? " selected" : ""}`} key={card.id} role="button" tabIndex={0} onClick={() => toggle(card.id)} onKeyDown={(event) => handleCardKeyDown(event, card.id)} style={{ opacity: selected.length >= 30 && !isSelected ? 0.55 : 1 }}>
              <div className="delete-zone">
                <button type="button" className="delete-card-button" aria-label={`Видалити картку ${card.en}`} onClick={(event) => requestDelete(event, card)}>×</button>
              </div>
              <div className="emoji">{card.emoji}</div>
              <h3>{card.en}</h3>
              <p>{card.uk}</p>
              <small style={{ display: "block", marginTop: 16, color: "#6b7d77" }}>{card.themeLabel} · {isSelected ? "обрано ✓" : "додати"}</small>
            </div>
          );
        })}
      </div>
      <div className="panel" style={{ textAlign: "center", marginTop: 34 }}>
        <strong>{selected.length} / 30 карток обрано</strong>
        <p>{selected.length < 30 ? `Залишилось обрати ще ${30 - selected.length} карток.` : "Набір готовий до навчання."}</p>
        {selected.length === 30 ? <Link className="button" href="/study">Почати навчання →</Link> : <button className="button" disabled style={{ opacity: .5, cursor: "not-allowed" }}>Обери ще {30 - selected.length} карток</button>}
      </div>
      {deleteCandidate && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => { if (!deleting) setDeleteCandidate(null); }}>
          <div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description" onMouseDown={(event) => event.stopPropagation()}>
            <h2 id="delete-title">Видалити картку?</h2>
            <p id="delete-description">Картку «{deleteCandidate.en}» буде видалено з каталогу. Повʼязаний прогрес також стане недоступним.</p>
            {deleteMessage && <p className="delete-error" role="alert">{deleteMessage}</p>}
            <div className="modal-actions">
              <button type="button" className="button secondary" onClick={() => setDeleteCandidate(null)} disabled={deleting}>Скасувати</button>
              <button type="button" className="button danger" onClick={confirmDelete} disabled={deleting}>{deleting ? "Видаляю…" : "Так, видалити"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
