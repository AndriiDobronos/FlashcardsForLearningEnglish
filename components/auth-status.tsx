"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { migrateLocalProgress } from "@/lib/progress-sync";

export default function AuthStatus(){
  const [email,setEmail]=useState<string|null>(null);
  const [syncMessage,setSyncMessage]=useState<string|null>(null);

  useEffect(()=>{
    const supabase=getSupabaseBrowserClient();
    if(!supabase)return;

    const migrateOnce=async(userId:string)=>{
      const migrationKey=`wordly-progress-migrated-${userId}`;
      if(localStorage.getItem(migrationKey)==="1")return;
      try{
        const result=await migrateLocalProgress(userId);
        localStorage.setItem(migrationKey,"1");
        if(result.migrated>0)setSyncMessage(`Синхронізовано: ${result.migrated} карток`);
      }catch{
        setSyncMessage("Синхронізація буде повторена пізніше");
      }
    };

    supabase.auth.getUser().then(({data})=>{
      setEmail(data.user?.email??null);
      if(data.user) void migrateOnce(data.user.id);
    });

    const{data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
      setEmail(session?.user?.email??null);
      if(session?.user) window.setTimeout(()=>void migrateOnce(session.user.id),0);
    });
    return()=>subscription.unsubscribe();
  },[]);

  if(!email)return <a href="/auth">Увійти</a>;
  return <span style={{display:"inline-flex",alignItems:"center",gap:8}}>
    <span title={email}>● {email.split("@")[0]}</span>
    {syncMessage&&<span style={{fontSize:12,opacity:.75}}>{syncMessage}</span>}
    <button className="nav-button" onClick={async()=>{const supabase=getSupabaseBrowserClient();await supabase?.auth.signOut()}}>Вийти</button>
  </span>
}

