import {orderTotal} from './workorder.ts';

export const overviewStages=['Draft','Approved','In progress','Paint booth','Quality check','Completed','Delivered'];
export const isOpenOrder=(r:any)=>!['Completed','Delivered'].includes(r.status);
export function overviewAmount(r:any){const n=orderTotal(r);return Number.isFinite(n)?n:0;}
export function recordDay(value:any){
 const s=String(value||'').slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return '';
 const d=new Date(s+'T12:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===s?s:'';
}
export function overviewData(data:any,now=new Date(),months=6){
 const orders=data.workorders||[],active=orders.filter(isOpenOrder),closed=orders.filter((r:any)=>!isOpenOrder(r));
 const today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
 const late=active.filter((r:any)=>recordDay(r.due)&&recordDay(r.due)<today);
 const low=(data.inventory||[]).filter((r:any)=>Number(r.quantity)<=Number(r.reorder||0));
 const stages=overviewStages.map(name=>({name,count:orders.filter((r:any)=>r.status===name).length}));
 const unknown=orders.filter((r:any)=>!overviewStages.includes(r.status)).length;
 const buckets=Array.from({length:months},(_,i)=>{const date=new Date(now.getFullYear(),now.getMonth()-months+1+i,1);return {key:`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`,date,value:0,count:0};});
 for(const r of orders){const day=recordDay(r.date)||recordDay(r.created);if(!day||day>today)continue;const bucket=buckets.find(b=>b.key===day.slice(0,7));if(bucket){bucket.count++;bucket.value+=overviewAmount(r);}}
 const categories=new Map<string,number>();for(const r of orders){const key=r.category||'Other';categories.set(key,(categories.get(key)||0)+1);}
 const categoryRows=[...categories].map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name));
 const queue=orders.filter((r:any)=>r.status!=='Delivered').slice().sort((a:any,b:any)=>{
  const priority=(r:any)=>late.includes(r)?0:r.status==='Completed'?1:2;
  return priority(a)-priority(b)||(recordDay(a.due)||'9999').localeCompare(recordDay(b.due)||'9999')||String(a.id).localeCompare(String(b.id));
 }).slice(0,5);
 return {orders,active,closed,late,low,stages,unknown,buckets,categories:categoryRows,queue,openValue:active.reduce((n:number,r:any)=>n+overviewAmount(r),0),completion:orders.length?Math.round(closed.length/orders.length*100):0,today};
}
