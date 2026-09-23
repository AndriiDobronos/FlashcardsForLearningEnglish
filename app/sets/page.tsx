"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadCatalog, type Theme } from "@/lib/catalog";
import { seedCards, type Card } from "@/lib/data";

const SELECTED_KEY="wordly-selected-cards-v1";

export default function SetsPage(){
  const[selected,setSelected]=useState<string[]>([]);
  const[themes,setThemes]=useState<Theme[]>([]);
  const[cards,setCards]=useState<Card[]>(seedCards);
  const[themeFilter,setThemeFilter]=useState("all");

  useEffect(()=>{
    try{setSelected(JSON.parse(localStorage.getItem(SELECTED_KEY)??"[]"))}catch{setSelected([])}
    loadCatalog().then(({themes:loadedThemes,cards:loadedCards})=>{setThemes(loadedThemes);setCards(loadedCards)});
  },[]);

  const visibleCards=useMemo(()=>themeFilter==="all"?cards:cards.filter(card=>card.theme===themeFilter),[cards,themeFilter]);
  const toggle=(id:string)=>{
    const next=selected.includes(id)?selected.filter(item=>item!==id):selected.length<30?[...selected,id]:selected;
    setSelected(next);
    localStorage.setItem(SELECTED_KEY,JSON.stringify(next));
  };

  return <div>
    <div className="eyebrow">Бібліотека</div>
    <h1>Обери 30 карток для навчання.</h1>
    <p style={{maxWidth:620}}>Обирай окремі слова та фрази. Натисни на картку, щоб додати або прибрати її з навчальної сесії.</p>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",margin:"24px 0"}}>
      <button className="button secondary" onClick={()=>setThemeFilter("all")}>Усі теми</button>
      {themes.map(theme=><button className="button secondary" key={theme.id} onClick={()=>setThemeFilter(theme.id)}>{theme.emoji} {theme.title}</button>)}
    </div>
    <div className="theme-grid">
      {visibleCards.map(card=><button className="theme-card" key={card.id} onClick={()=>toggle(card.id)} style={{textAlign:"left",border:selected.includes(card.id)?"2px solid var(--coral)":"1px solid var(--line)",opacity:selected.length>=30&&!selected.includes(card.id)?0.55:1}}>
        <div className="emoji">{card.emoji}</div>
        <h3>{card.en}</h3>
        <p>{card.uk}</p>
        <small style={{display:"block",marginTop:16,color:"#6b7d77"}}>{card.themeLabel} · {selected.includes(card.id)?"обрано ✓":"додати"}</small>
      </button>)}
    </div>
    <div className="panel" style={{textAlign:"center",marginTop:34}}>
      <strong>{selected.length} / 30 карток обрано</strong>
      <p>{selected.length<30?`Залишилось обрати ще ${30-selected.length} карток.`:"Набір готовий до навчання."}</p>
      {selected.length===30?<Link className="button" href="/study">Почати навчання →</Link>:<button className="button" disabled style={{opacity:.5,cursor:"not-allowed"}}>Обери ще {30-selected.length} карток</button>}
    </div>
  </div>;
}
