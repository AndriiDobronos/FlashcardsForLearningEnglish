export type Direction = "en-uk" | "uk-en";
export type Card = { id:string; theme:string; themeLabel:string; en:string; uk:string; example:string; emoji:string };
export type Progress = { cardId:string; direction:Direction; successCount:number; failureCount:number; dueAt:string; learned:boolean; lastReviewedAt?:string };
export const seedCards: Card[] = [
 {id:"travel-001",theme:"travel",themeLabel:"Подорожі",en:"to figure out",uk:"розібратися, зрозуміти",example:"I need time to figure out this problem.",emoji:"🧭"},
 {id:"travel-002",theme:"travel",themeLabel:"Подорожі",en:"a fresh start",uk:"новий початок",example:"Moving to a new city felt like a fresh start.",emoji:"🌅"},
 {id:"work-001",theme:"work",themeLabel:"Робота",en:"keep in touch",uk:"підтримувати звʼязок",example:"Letʼs keep in touch after the course.",emoji:"💬"},
 {id:"food-001",theme:"food",themeLabel:"Їжа та напої",en:"a snack",uk:"перекус",example:"I packed a healthy snack for the trip.",emoji:"🍎"},
 {id:"home-001",theme:"home",themeLabel:"Дім",en:"tidy up",uk:"прибрати",example:"I need to tidy up before the guests arrive.",emoji:"🏠"},
 {id:"verbs-001",theme:"verbs",themeLabel:"Фразові дієслова",en:"look after",uk:"піклуватися про",example:"Can you look after my cat this weekend?",emoji:"🐾"}
];
const KEY="wordly-progress-v1";
export function loadProgress(): Progress[]{if(typeof window==="undefined")return[];try{return JSON.parse(localStorage.getItem(KEY)??"[]") as Progress[]}catch{return[]}}
export function saveProgress(progress:Progress[]){if(typeof window!=="undefined")localStorage.setItem(KEY,JSON.stringify(progress))}
