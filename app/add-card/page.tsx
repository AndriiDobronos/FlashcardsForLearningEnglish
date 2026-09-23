"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { loadCatalog, type Theme } from "@/lib/catalog";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AddCardPage(){
  const [themes,setThemes]=useState<Theme[]>([]);
  const [themeId,setThemeId]=useState("");
  const [english,setEnglish]=useState("");
  const [ukrainian,setUkrainian]=useState("");
  const [example,setExample]=useState("");
  const [message,setMessage]=useState("");
  const [saving,setSaving]=useState(false);

  useEffect(()=>{loadCatalog().then(({themes:loadedThemes})=>{setThemes(loadedThemes);setThemeId(current=>current||loadedThemes[0]?.id||"")})},[]);

  const submit=async(event:FormEvent)=>{
    event.preventDefault();
    setMessage("");
    const supabase=getSupabaseBrowserClient();
    if(!supabase){setMessage("Supabase не підключено. Перевірте змінні середовища.");return}
    const{data:{user}}=await supabase.auth.getUser();
    if(!user){setMessage("Спочатку увійдіть через email.");return}
    setSaving(true);
    const id=`${themeId}-${Date.now()}`;
    const{error}=await supabase.from("cards").insert({id,theme_id:themeId,english_text:english.trim(),ukrainian_text:ukrainian.trim(),example_sentence:example.trim(),image_url:null});
    setSaving(false);
    if(error){setMessage(`Не вдалося додати картку: ${error.message}`);return}
    setEnglish("");setUkrainian("");setExample("");
    setMessage("Картку додано. Відкрийте /sets і оновіть сторінку, щоб обрати її до набору.");
  };

  return <div className="form-page"><div className="eyebrow">Бібліотека</div><h1 style={{fontSize:"clamp(38px,6vw,64px)"}}>Додай нове слово.</h1><p className="form-lead">Заповніть чотири поля — картка зʼявиться у вибраному тематичному наборі.</p><form onSubmit={submit} className="panel card-form"><label htmlFor="theme">Тематичний набір</label><select id="theme" value={themeId} onChange={event=>setThemeId(event.target.value)} required><option value="" disabled>Оберіть тему</option>{themes.map(theme=><option key={theme.id} value={theme.id}>{theme.emoji} {theme.title}</option>)}</select><label htmlFor="english">Англійське слово або фраза</label><input id="english" required value={english} onChange={event=>setEnglish(event.target.value)} placeholder="check in" /><label htmlFor="ukrainian">Український переклад</label><input id="ukrainian" required value={ukrainian} onChange={event=>setUkrainian(event.target.value)} placeholder="зареєструватися" /><label htmlFor="example">Приклад використання</label><textarea id="example" required value={example} onChange={event=>setExample(event.target.value)} placeholder="We need to check in before the flight." rows={4} /><button className="button" type="submit" disabled={saving||!themeId}>{saving?"Зберігаю…":"Додати картку"}</button>{message&&<p role="status" className="form-message">{message}</p>}</form><Link href="/sets" className="eyebrow form-back">← До наборів</Link></div>;
}
