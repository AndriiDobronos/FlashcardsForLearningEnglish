import type { Direction, Progress } from "./data";
const INTERVALS=[1,3,7,14,30,90,180];
const FAILURE_DELAY_MINUTES=10;
const addDays=(days:number)=>new Date(Date.now()+days*86400000).toISOString();
const addMinutes=(minutes:number)=>new Date(Date.now()+minutes*60000).toISOString();
export function applyReview(current:Progress|undefined,cardId:string,direction:Direction,known:boolean):Progress{
 const item=current??{cardId,direction,successCount:0,failureCount:0,dueAt:new Date().toISOString(),learned:false};
 const successCount=known&&item.direction===direction?item.successCount+1:item.successCount;
 const failureCount=known?item.failureCount:item.failureCount+1;
 const learned=successCount>=4;
 const dueAt=known?addDays(INTERVALS[Math.min(Math.max(successCount-1,0),INTERVALS.length-1)]):addMinutes(FAILURE_DELAY_MINUTES);
 return {...item,cardId,direction,successCount,failureCount,learned,dueAt,lastReviewedAt:new Date().toISOString()};
}
export function isDue(item:Progress){return new Date(item.dueAt).getTime()<=Date.now()}
