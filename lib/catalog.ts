import { getSupabaseBrowserClient } from "./supabase-browser";
import { seedCards, type Card } from "./data";

export type Theme = { id:string; title:string; description:string; emoji:string; cardCount:number };

const fallbackThemes:Theme[]=[
  {id:"travel",title:"Подорожі",description:"Аеропорт, готель і розмови в дорозі",emoji:"✈️",cardCount:2},
  {id:"food",title:"Їжа та напої",description:"Замовлення, смаки та рецепти",emoji:"🍳",cardCount:1},
  {id:"work",title:"Робота",description:"Зустрічі, листування та карʼєра",emoji:"💼",cardCount:1},
  {id:"home",title:"Дім",description:"Кімнати, побут і повсякденні справи",emoji:"🏠",cardCount:1},
  {id:"verbs",title:"Фразові дієслова",description:"Корисні вирази для живої мови",emoji:"💬",cardCount:1},
];

export async function loadCatalog(){
  const supabase=getSupabaseBrowserClient();
  if(!supabase)return {themes:fallbackThemes,cards:seedCards};

  const[{data:themeRows,error:themeError},{data:cardRows,error:cardError}]=await Promise.all([
    supabase.from("themes").select("id,title,description,emoji").order("title"),
    supabase.from("cards").select("id,theme_id,english_text,ukrainian_text,example_sentence,image_url").order("created_at"),
  ]);

  if(themeError||cardError||!themeRows?.length||!cardRows?.length)return {themes:fallbackThemes,cards:seedCards};

  const themeMap=new Map(themeRows.map(theme=>[theme.id,theme]));
  const cards:Card[]=cardRows.map(card=>({
    id:card.id,
    theme:card.theme_id,
    themeLabel:themeMap.get(card.theme_id)?.title??card.theme_id,
    en:card.english_text,
    uk:card.ukrainian_text,
    example:card.example_sentence,
    emoji:themeMap.get(card.theme_id)?.emoji??"📚",
    imageUrl:card.image_url??undefined,
  }));
  const counts=new Map<string,number>();
  cards.forEach(card=>counts.set(card.theme,(counts.get(card.theme)??0)+1));
  const themes:Theme[]=themeRows.map(theme=>({id:theme.id,title:theme.title,description:theme.description,emoji:theme.emoji,cardCount:counts.get(theme.id)??0}));
  return {themes,cards};
}
