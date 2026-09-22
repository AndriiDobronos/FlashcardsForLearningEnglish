"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AuthCallbackPage(){
  const router=useRouter();
  const [error,setError]=useState("");

  useEffect(()=>{
    const completeSignIn=async()=>{
      const supabase=getSupabaseBrowserClient();
      if(!supabase){router.replace("/auth");return;}
      const{data,error:sessionError}=await supabase.auth.getSession();
      if(sessionError){setError(sessionError.message);return;}
      if(data.session){router.replace("/");return;}
      setError("Посилання не створило активну сесію. Запросіть нове magic-link посилання і відкрийте його в цьому ж браузері.");
    };
    void completeSignIn();
  },[router]);

  return <div className="study-layout"><div className="eyebrow">Акаунт Wordly</div><h2>{error?"Не вдалося завершити вхід":"Завершуємо вхід…"}</h2><p>{error||"Зачекайте, ми зберігаємо вашу сесію."}</p><a href="/auth">Повернутися до входу</a></div>;
}
