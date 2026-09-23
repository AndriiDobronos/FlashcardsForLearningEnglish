"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadProgress, type Progress } from "@/lib/data";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type ReviewEvent={created_at:string};
type Stats={streak:number;learned:number;due:number;days:{label:string;value:number}[];loading:boolean};

const dateKey=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
const dayLabel=(date:Date)=>new Intl.DateTimeFormat("uk-UA",{weekday:"short"}).format(date).replace(".","");

function calculateStreak(activityDates:string[]){
  const active=new Set(activityDates);
  const today=new Date();
  let cursor=new Date(today);
  if(!active.has(dateKey(cursor))){cursor.setDate(cursor.getDate()-1);if(!active.has(dateKey(cursor)))return 0;}
  let streak=0;
  while(active.has(dateKey(cursor))){streak++;cursor.setDate(cursor.getDate()-1);}
  return streak;
}

function calculateStats(progress:Progress[],events:ReviewEvent[]):Stats{
  const eventDates=events.map(event=>new Date(event.created_at)).filter(date=>!Number.isNaN(date.getTime()));
  const activityDates=[...eventDates,...progress.flatMap(item=>item.lastReviewedAt?[new Date(item.lastReviewedAt)]:[])].map(dateKey);
  const learned=new Set(progress.filter(item=>item.learned).map(item=>item.cardId)).size;
  const due=progress.filter(item=>!item.learned&&new Date(item.dueAt).getTime()<=Date.now()).length;
  const days=Array.from({length:5},(_,offset)=>{const date=new Date();date.setHours(0,0,0,0);date.setDate(date.getDate()-(4-offset));const value=eventDates.filter(event=>dateKey(event)===dateKey(date)).length||progress.filter(item=>item.lastReviewedAt&&dateKey(new Date(item.lastReviewedAt))===dateKey(date)).length;return{label:dayLabel(date),value}});
  return{streak:calculateStreak(activityDates),learned,due,days,loading:false};
}

export default function Home(){
  const[stats,setStats]=useState<Stats>({streak:0,learned:0,due:0,days:[],loading:true});
  useEffect(()=>{
    const load=async()=>{
      const local=loadProgress();
      const supabase=getSupabaseBrowserClient();
      if(!supabase){setStats(calculateStats(local,[]));return;}
      const{data:userData}=await supabase.auth.getUser();
      if(!userData.user){setStats(calculateStats(local,[]));return;}
      const[{data:remoteProgress},{data:events}]=await Promise.all([
        supabase.from("user_card_progress").select("card_id,learned,due_at,last_reviewed_at").eq("user_id",userData.user.id),
        supabase.from("review_events").select("created_at").eq("user_id",userData.user.id).gte("created_at",new Date(Date.now()-6*86400000).toISOString()),
      ]);
      const progress:Progress[]=(remoteProgress??[]).map(item=>({cardId:item.card_id,direction:"en-uk",successCount:0,failureCount:0,dueAt:item.due_at,learned:item.learned,lastReviewedAt:item.last_reviewed_at??undefined}));
      setStats(calculateStats(progress.length?progress:local,(events??[]) as ReviewEvent[]));
    };
    void load();
  },[]);
  const maxValue=Math.max(...stats.days.map(day=>day.value),1);
  return <><section className="hero"><div className="hero-copy"><div className="eyebrow">Твій простір для англійської</div><h1>Маленькі кроки. Сильна памʼять.</h1><p>Вивчай слова та фрази через короткі сесії, озвучення й розумні повторення.</p></div><Link className="button" href="/study">Почати навчання →</Link></section><div className="grid"><div className="stat"><small>Безперервне навчання</small><strong>{stats.loading?"—":stats.streak}</strong><small>днів поспіль 🔥</small></div><div className="stat"><small>Вивчено всього</small><strong>{stats.loading?"—":stats.learned}</strong><small>слів і фраз</small></div><div className="stat"><small>На сьогодні</small><strong>{stats.loading?"—":stats.due}</strong><small>карток до повторення</small></div></div><section className="panel" style={{marginTop:16}}><div className="section-row"><div><h2>Твій ритм</h2><p style={{margin:0}}>Картки за останні 5 днів</p></div><span className="eyebrow">{stats.loading?"Завантаження…":"Реальна активність"}</span></div><div className="chart">{stats.days.map((day,i)=><div className="bar-wrap" key={`${day.label}-${i}`}><div className={`bar ${i===stats.days.length-1?"today":""}`} style={{height:`${day.value?Math.max(day.value/maxValue*145,12):4}px`}}></div>{day.label}</div>)}</div></section></>;
}
