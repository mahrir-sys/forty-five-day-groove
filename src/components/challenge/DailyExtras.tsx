import { useEffect, useRef, useState } from 'react';
import { Target, Volume2, Vibrate, X, Check, NotebookPen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useLanguage } from '@/hooks/use-language';
import { type AppState, dayNumber } from '@/lib/challenge';
import { coachingChallenge, milestone, saveReflection } from '@/lib/engagement';
import { coachingText } from '@/lib/coaching';
import { engagementCopy } from '@/lib/engagement-copy';
import { celebrate } from '@/lib/check-feedback';
import { personalText } from '@/lib/personalization';
export function Reflection({state,date,update}:{state:AppState;date:string;update:(fn:(s:AppState)=>AppState)=>void}){
 const {language}=useLanguage();const c=engagementCopy[language];const [text,setText]=useState(state.reflections?.[date]??'');const [saved,setSaved]=useState(false);
 useEffect(()=>{setText(state.reflections?.[date]??'');setSaved(false);},[date,state.reflections]);
 return <section className="mt-9 border-t pt-6"><h2 className="flex items-center gap-2 text-sm font-semibold"><NotebookPen className="size-4 text-primary"/>{c.reflection}</h2><Textarea aria-label={c.reflection} placeholder={c.placeholder} maxLength={1000} className="mt-3 min-h-24 resize-y" value={text} onChange={e=>{setText(e.target.value);setSaved(false);}}/><div className="mt-2 flex items-center justify-between"><span className="text-xs text-muted-foreground">{text.length}/1000</span><Button variant="ghost" onClick={()=>{update(s=>saveReflection(s,date,text));setSaved(true);}}><Check/>{saved?c.saved:c.save}</Button></div></section>;
}
export function FeedbackControls({sound,vibration,setSound,setVibration}:{sound:boolean;vibration:boolean;setSound:(v:boolean)=>void;setVibration:(v:boolean)=>void}){
 const {language}=useLanguage();const c=engagementCopy[language];return <div className="mt-5 flex flex-wrap gap-5 text-xs text-muted-foreground"><label className="flex items-center gap-2"><Volume2 className="size-4"/>{c.sound}<Switch aria-label={c.sound} checked={sound} onCheckedChange={setSound}/></label><label className="flex items-center gap-2"><Vibrate className="size-4"/>{c.vibration}<Switch aria-label={c.vibration} checked={vibration} onCheckedChange={setVibration}/></label></div>;
}
export function FocusList({state,today,onCheck,onExit}:{state:AppState;today:string;onCheck:(id:string)=>void;onExit:()=>void}){
 const {language,challengeName}=useLanguage();const c=engagementCopy[language];const remaining=state.challenges.filter(item=>!(state.log[today]??[]).includes(item.id));
 return <main className="mx-auto min-h-screen max-w-md px-5 py-8"><header className="flex items-center justify-between"><span className="flex items-center gap-2 text-primary"><Target className="size-4"/>45 days</span><Button variant="ghost" size="icon" aria-label={c.exit} title={c.exit} onClick={onExit}><X/></Button></header><h1 className="mt-14 text-3xl font-bold">{c.remaining}</h1><p className="mt-2 text-muted-foreground">{remaining.length} / {state.challenges.length}</p><ul className="mt-8 space-y-4">{remaining.map(item=><li key={item.id}><Button variant="outline" className="h-auto min-h-24 w-full justify-start whitespace-normal gap-4 px-5 py-6 text-left text-2xl leading-snug" onClick={()=>onCheck(item.id)}><span className="size-8 shrink-0 rounded-full border-2 border-primary"/><span className="min-w-0 break-words">{challengeName(item.name)}</span></Button></li>)}</ul>{!remaining.length&&<div role="status" className="mt-12"><Check className="size-12 text-primary"/><p className="mt-5 text-2xl font-display">{c.complete}</p><Button variant="ghost" className="mt-7" onClick={onExit}>{c.exit}</Button></div>}</main>;
}
export function CoachingAndMilestones({state,today}:{state:AppState;today:string}){
 const {language,challengeName}=useLanguage();const c=engagementCopy[language];const checkedOpen=useRef('');const [challengeId,setChallengeId]=useState<string|null>(null);const [milestoneDay,setMilestoneDay]=useState<number|null>(null);
 useEffect(()=>{
  if(new Date().getHours()<5)return;
  const key=`45days:opened:${state.startDate}:${today}`;
  if(checkedOpen.current===key)return;checkedOpen.current=key;
  try{if(localStorage.getItem(key))return;localStorage.setItem(key,'1');}catch{}
  setChallengeId(coachingChallenge(state,today)?.id??null);
 },[state,today]);
 const reached=milestone(state,today);
 useEffect(()=>{
  if(!reached)return;
  const key=`45days:milestone:${state.startDate}:${reached}`;
  try{if(localStorage.getItem(key))return;localStorage.setItem(key,'1');}catch{}
  setMilestoneDay(reached);void celebrate(true);
 },[reached,state.startDate]);
 const challenge=state.challenges.find(item=>item.id===challengeId);
 const advice=coachingText(challenge?.name??'',dayNumber(state.startDate??today,today),language);
 const dismiss=()=>{setChallengeId(null);document.getElementById('today-list')?.scrollIntoView({block:'start'});};
 const words=milestoneDay===7||milestoneDay===23||milestoneDay===40||milestoneDay===45?c.milestones[milestoneDay]:'';
 return <><Sheet open={Boolean(challenge)} onOpenChange={open=>{if(!open)dismiss();}}><SheetContent side="bottom" className="mx-auto max-w-md max-h-[90dvh] overflow-y-auto"><Target className="mb-4 size-6 text-primary"/><SheetTitle>{c.coach}</SheetTitle><SheetDescription className="mt-3">{personalText(advice.opening,state.firstName)}</SheetDescription><h3 className="mt-5 break-words text-xl">{challenge?challengeName(challenge.name):''}</h3>{(['benefit','tip','visualize'] as const).map(key=><div key={key} className="mt-5"><h4 className="text-xs font-semibold uppercase text-primary">{c[key]}</h4><p className="mt-2 text-sm leading-relaxed">{advice[key]}</p></div>)}<Button className="mt-6 w-full" onClick={dismiss}>{c.next}</Button></SheetContent></Sheet>
 <Sheet open={milestoneDay!==null && !challenge} onOpenChange={open=>{if(!open)setMilestoneDay(null);}}><SheetContent side="bottom" className="mx-auto max-w-md"><Sparkles className="mb-5 size-8 text-primary"/><SheetTitle>{c.milestone} · {milestoneDay}/45</SheetTitle><SheetDescription className="mt-5 text-lg leading-relaxed text-foreground">{words}</SheetDescription><Button className="mt-6 w-full" onClick={()=>setMilestoneDay(null)}>{c.next}</Button></SheetContent></Sheet></>;
}
