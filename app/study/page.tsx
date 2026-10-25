"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import Link from "next/link";
import { applyReview, isDue } from "@/lib/scheduler";
import { loadProgress, mergeProgress, saveProgress, seedCards, type Direction, type Progress } from "@/lib/data";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { loadRemoteProgress, syncReview } from "@/lib/progress-sync";
import { loadCatalog } from "@/lib/catalog";

export default function StudyPage() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState<Direction>("en-uk");
  const [progress, setProgress] = useState<Progress[]>([]);
  const [cards, setCards] = useState(seedCards);
  const [syncMessage, setSyncMessage] = useState("");
  const touchStartX = useRef<number | null>(null);
  const suppressClick = useRef(false);
  const card = useMemo(() => cards[index % cards.length] ?? seedCards[0], [cards, index]);

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      const local = loadProgress();
      let availableProgress = local;
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          try {
            const remote = await loadRemoteProgress(data.user.id);
            if (remote.length) {
              availableProgress = mergeProgress(local, remote);
              saveProgress(availableProgress);
            }
          } catch (error) {
            console.error("Remote progress load failed", error);
          }
        }
      }
      let selectedCardIds: string[] = [];
      let selectedThemes: string[] = [];
      try {
        selectedCardIds = JSON.parse(localStorage.getItem("wordly-selected-cards-v1") ?? "[]");
        selectedThemes = JSON.parse(localStorage.getItem("wordly-selected-v1") ?? "[]");
      } catch {}
      const { cards: catalogCards } = await loadCatalog();
      const selectedPool = selectedCardIds.length
        ? catalogCards.filter((item) => selectedCardIds.includes(item.id))
        : selectedThemes.length
          ? catalogCards.filter((item) => selectedThemes.includes(item.theme))
          : catalogCards;
      const pool = selectedPool.length ? selectedPool : catalogCards;
      const dueCards = pool.filter((item) => {
        const itemProgress = availableProgress.filter((entry) => entry.cardId === item.id);
        return itemProgress.length === 0 || itemProgress.some((entry) => !entry.learned && isDue(entry));
      });
      if (active) {
        setProgress(availableProgress);
        setCards(dueCards.length ? dueCards : pool);
      }
    };
    void initialize();
    return () => { active = false; };
  }, []);

  const speakEnglish = useCallback(() => {
    if (typeof window !== "undefined") {
      const utterance = new SpeechSynthesisUtterance(card.en);
      utterance.lang = "en-US";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }, [card.en]);

  const englishVisible = (direction === "en-uk" && !flipped) || (direction === "uk-en" && flipped);
  const isSentence = /[.!?]$/.test(card.en.trim()) || card.en.trim().split(/\s+/).length > 6;

  useEffect(() => {
    if (!englishVisible) return;
    const timer = window.setTimeout(speakEnglish, 120);
    return () => window.clearTimeout(timer);
  }, [card.id, englishVisible, speakEnglish]);

  const review = async (known: boolean) => {
    const current = progress.find((item) => item.cardId === card.id && item.direction === direction);
    const next = applyReview(current, card.id, direction, known);
    const other = progress.find((item) => item.cardId === card.id && item.direction !== direction);
    const completedToday = next.successCount >= 2 && (other?.successCount ?? 0) >= 2;
    next.learned = completedToday;
    const updated = [...progress.filter((item) => !(item.cardId === card.id && item.direction === direction)), next];
    setProgress(updated);
    saveProgress(updated);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setSyncMessage("Локальний режим: Supabase не підключено");
    } else {
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError || !data.user) {
        setSyncMessage("Увійдіть через email, щоб синхронізувати прогрес");
      } else {
        try {
          await syncReview(data.user.id, card.id, direction, known, next);
          setSyncMessage("");
        } catch (error) {
          console.error("Supabase progress sync failed", error);
          const details = typeof error === "object" && error !== null && "message" in error ? String(error.message) : "Невідома помилка Supabase";
          const code = typeof error === "object" && error !== null && "code" in error ? ` [код ${String(error.code)}]` : "";
          setSyncMessage(`Помилка синхронізації: ${details}${code}`);
        }
      }
    }

    const currentIndex = index % cards.length;
    if (completedToday) {
      const remainingCards = cards.filter((item) => item.id !== card.id);
      setCards(remainingCards);
      setIndex(remainingCards.length ? Math.min(currentIndex, remainingCards.length - 1) : 0);
    } else {
      setIndex(index + 1);
    }
    setDirection(known ? (direction === "en-uk" ? "uk-en" : "en-uk") : direction);
    setFlipped(false);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || !flipped) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 60) return;
    suppressClick.current = true;
    void review(delta > 0);
  };

  if (!cards.length) {
    return <div className="study-layout"><div className="eyebrow">Сесію завершено</div><h2>Усі картки на сьогодні пройдені 🎉</h2><p>Повернися завтра, щоб продовжити повторення.</p><Link href="/" className="button">До прогресу</Link></div>;
  }

  const flipCard = () => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    setFlipped((value) => !value);
  };

  return (
    <div className="study-layout">
      <div className="eyebrow">Сесія на сьогодні</div>
      <h2>Тримай ритм</h2>
      <div className="flashcard" onClick={flipCard} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div className="emoji" aria-hidden="true">{card.emoji}</div>
        <div className="word">{flipped ? (direction === "en-uk" ? card.uk : card.en) : (direction === "en-uk" ? card.en : card.uk)}</div>
        {englishVisible && !isSentence && <div className="hint">{card.example}</div>}
        {englishVisible && <button type="button" className="repeat-speech" onClick={(event) => { event.stopPropagation(); speakEnglish(); }} aria-label="Прослухати англійською ще раз">🔊</button>}
        {flipped && <div className="desktop-card-actions" onClick={(event) => event.stopPropagation()}>
          <button className="card-chevron left" type="button" onClick={() => void review(false)} aria-label="Ще не знаю">‹</button>
          <button className="card-chevron right" type="button" onClick={() => void review(true)} aria-label="Знаю">›</button>
        </div>}
      </div>
      {syncMessage && <p role="status" style={{ color: "#9a3412" }}>{syncMessage}</p>}
      <div className="mobile-actions">{flipped && <><button className="swipe no" onClick={() => void review(false)} aria-label="Ще не знаю">←</button><button className="swipe yes" onClick={() => void review(true)} aria-label="Знаю">→</button></>}</div>
      <Link href="/" className="eyebrow">← До прогресу</Link>
    </div>
  );
}
