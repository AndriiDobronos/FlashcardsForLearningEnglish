export type Direction = "en-uk" | "uk-en";
export type Card = { id:string; theme:string; themeLabel:string; en:string; uk:string; example:string; emoji:string; imageUrl?:string };
export type Progress = { cardId:string; direction:Direction; successCount:number; failureCount:number; dueAt:string; learned:boolean; lastReviewedAt?:string };
export const seedCards: Card[] = [
 {id:"travel-001",theme:"travel",themeLabel:"Подорожі",en:"to figure out",uk:"розібратися, зрозуміти",example:"I need time to figure out this problem.",emoji:"🧭"},
 {id:"travel-002",theme:"travel",themeLabel:"Подорожі",en:"a fresh start",uk:"новий початок",example:"Moving to a new city felt like a fresh start.",emoji:"🌅"},
 {id:"travel-003",theme:"travel",themeLabel:"Подорожі",en:"a boarding pass",uk:"посадковий талон",example:"Please have your boarding pass ready.",emoji:"🎫"},
 {id:"travel-004",theme:"travel",themeLabel:"Подорожі",en:"book a room",uk:"забронювати номер",example:"I need to book a room for two nights.",emoji:"🛎️"},
 {id:"travel-005",theme:"travel",themeLabel:"Подорожі",en:"get lost",uk:"загубитися",example:"We got lost in the old town.",emoji:"🗺️"},
 {id:"travel-006",theme:"travel",themeLabel:"Подорожі",en:"a round trip",uk:"поїздка туди й назад",example:"Can I buy a round-trip ticket to London?",emoji:"🚆"},
 {id:"work-001",theme:"work",themeLabel:"Робота",en:"keep in touch",uk:"підтримувати звʼязок",example:"Letʼs keep in touch after the course.",emoji:"💬"},
 {id:"work-002",theme:"work",themeLabel:"Робота",en:"a deadline",uk:"кінцевий термін",example:"The deadline is next Friday.",emoji:"⏰"},
 {id:"work-003",theme:"work",themeLabel:"Робота",en:"schedule a meeting",uk:"призначити зустріч",example:"Letʼs schedule a meeting for tomorrow.",emoji:"📅"},
 {id:"work-004",theme:"work",themeLabel:"Робота",en:"a workload",uk:"робоче навантаження",example:"My workload is lighter this week.",emoji:"📚"},
 {id:"work-005",theme:"work",themeLabel:"Робота",en:"take notes",uk:"робити нотатки",example:"I always take notes during meetings.",emoji:"📝"},
 {id:"work-006",theme:"work",themeLabel:"Робота",en:"get promoted",uk:"отримати підвищення",example:"She worked hard and got promoted.",emoji:"📈"},
 {id:"food-001",theme:"food",themeLabel:"Їжа та напої",en:"a snack",uk:"перекус",example:"I packed a healthy snack for the trip.",emoji:"🍎"},
 {id:"food-002",theme:"food",themeLabel:"Їжа та напої",en:"delicious",uk:"смачний",example:"This soup is absolutely delicious.",emoji:"😋"},
 {id:"food-003",theme:"food",themeLabel:"Їжа та напої",en:"order takeaway",uk:"замовити їжу із собою",example:"Letʼs order takeaway tonight.",emoji:"🥡"},
 {id:"food-004",theme:"food",themeLabel:"Їжа та напої",en:"ingredients",uk:"інгредієнти",example:"What ingredients do we need?",emoji:"🥕"},
 {id:"food-005",theme:"food",themeLabel:"Їжа та напої",en:"spicy",uk:"гострий",example:"This curry is too spicy for me.",emoji:"🌶️"},
 {id:"food-006",theme:"food",themeLabel:"Їжа та напої",en:"the bill, please",uk:"рахунок, будь ласка",example:"Could we have the bill, please?",emoji:"🧾"},
 {id:"home-001",theme:"home",themeLabel:"Дім",en:"tidy up",uk:"прибрати",example:"I need to tidy up before the guests arrive.",emoji:"🏠"},
 {id:"home-002",theme:"home",themeLabel:"Дім",en:"do the laundry",uk:"прати",example:"I do the laundry on Saturdays.",emoji:"🧺"},
 {id:"home-003",theme:"home",themeLabel:"Дім",en:"the living room",uk:"вітальня",example:"The sofa is in the living room.",emoji:"🛋️"},
 {id:"home-004",theme:"home",themeLabel:"Дім",en:"turn on",uk:"увімкнути",example:"Please turn on the light.",emoji:"💡"},
 {id:"home-005",theme:"home",themeLabel:"Дім",en:"run out of",uk:"закінчитися",example:"We have run out of milk.",emoji:"🥛"},
 {id:"home-006",theme:"home",themeLabel:"Дім",en:"make yourself at home",uk:"почувайся як удома",example:"Come in and make yourself at home.",emoji:"🪴"},
 {id:"verbs-001",theme:"verbs",themeLabel:"Фразові дієслова",en:"look after",uk:"піклуватися про",example:"Can you look after my cat this weekend?",emoji:"🐾"},
 {id:"verbs-002",theme:"verbs",themeLabel:"Фразові дієслова",en:"find out",uk:"дізнатися",example:"Iʼll find out what time the train leaves.",emoji:"🔎"},
 {id:"verbs-003",theme:"verbs",themeLabel:"Фразові дієслова",en:"give up",uk:"здатися, кинути",example:"Donʼt give up when it gets difficult.",emoji:"🏳️"},
 {id:"verbs-004",theme:"verbs",themeLabel:"Фразові дієслова",en:"put off",uk:"відкладати",example:"Try not to put off your homework.",emoji:"📌"},
 {id:"verbs-005",theme:"verbs",themeLabel:"Фразові дієслова",en:"come across",uk:"натрапити на",example:"I came across an interesting article.",emoji:"📰"},
 {id:"verbs-006",theme:"verbs",themeLabel:"Фразові дієслова",en:"work out",uk:"вийти, скластися",example:"Everything will work out in the end.",emoji:"✅"}
];
const KEY="wordly-progress-v1";
export function loadProgress(): Progress[]{if(typeof window==="undefined")return[];try{return JSON.parse(localStorage.getItem(KEY)??"[]") as Progress[]}catch{return[]}}
export function saveProgress(progress:Progress[]){if(typeof window!=="undefined")localStorage.setItem(KEY,JSON.stringify(progress))}

export function mergeProgress(local:Progress[], remote:Progress[]):Progress[]{
 const merged=new Map(local.map(item=>[`${item.cardId}:${item.direction}`,item]));
 for(const item of remote){
  const key=`${item.cardId}:${item.direction}`;
  const current=merged.get(key);
  if(!current||new Date(item.lastReviewedAt??0).getTime()>=new Date(current.lastReviewedAt??0).getTime())merged.set(key,item);
 }
 return Array.from(merged.values());
}
