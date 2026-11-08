import { useEffect, useRef, useState, type TouchEvent } from 'react';
import { Target, Volume2, Vibrate, X, Check, NotebookPen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useLanguage } from '@/hooks/use-language';
import { type AppState, dayNumber } from '@/lib/challenge';
import { canOpenDailyCoaching, coachingChallenge, milestone, saveReflection } from '@/lib/engagement';
import { coachingText } from '@/lib/coaching';
import { engagementCopy } from '@/lib/engagement-copy';
import { celebrate, checkFeedback, SOUND_PROFILES, type SoundProfile } from '@/lib/check-feedback';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { personalText } from '@/lib/personalization';
export function Reflection({state,date,update}:{state:AppState;date:string;update:(fn:(s:AppState)=>AppState)=>void}){
 const {language}=useLanguage();const c=engagementCopy[language];const [text,setText]=useState(state.reflections?.[date]??'');const [saved,setSaved]=useState(false);
 useEffect(()=>{setText(state.reflections?.[date]??'');setSaved(false);},[date,state.reflections]);
 return <section className="mt-9 border-t pt-6"><h2 className="flex items-center gap-2 text-sm font-semibold"><NotebookPen className="size-4 text-primary"/>{c.reflection}</h2><Textarea aria-label={c.reflection} placeholder={c.placeholder} maxLength={1000} className="mt-3 min-h-24 resize-y" value={text} onChange={e=>{setText(e.target.value);setSaved(false);}}/><div className="mt-2 flex items-center justify-between"><span className="text-xs text-muted-foreground">{text.length}/1000</span><Button variant="ghost" onClick={()=>{update(s=>saveReflection(s,date,text));setSaved(true);}}><Check/>{saved?c.saved:c.save}</Button></div></section>;
}
const profileCopy={
 en:{label:'Sound profile',check:'Play check',final:'Play last check',names:{harmonic:'Harmonic',click:'Classic click',zen:'Zen chimes',arcade:'8-bit arcade'}},
 sv:{label:'Ljudprofil',check:'Provlyssna bock',final:'Provlyssna sista bock',names:{harmonic:'Harmonisk',click:'Klassiskt klick',zen:'Zen/klockspel',arcade:'8-bit/arkad'}},
 fr:{label:'Profil sonore',check:'Écouter la coche',final:'Écouter la dernière coche',names:{harmonic:'Harmonique',click:'Clic classique',zen:'Carillon zen',arcade:'Arcade 8 bits'}},
} as const;
export function FeedbackControls({sound,vibration,setSound,setVibration,profile,setProfile}:{sound:boolean;vibration:boolean;setSound:(v:boolean)=>void;setVibration:(v:boolean)=>void;profile:SoundProfile;setProfile:(v:SoundProfile)=>void}){
 const {language}=useLanguage();const c=engagementCopy[language];const p=profileCopy[language];return <div className="mt-5"><div className="flex flex-wrap gap-5 text-xs text-muted-foreground"><label className="flex items-center gap-2"><Volume2 className="size-4"/>{c.sound}<Switch aria-label={c.sound} checked={sound} onCheckedChange={setSound}/></label><label className="flex items-center gap-2"><Vibrate className="size-4"/>{c.vibration}<Switch aria-label={c.vibration} checked={vibration} onCheckedChange={setVibration}/></label></div>
 <div className="mt-4"><span className="text-xs text-muted-foreground">{p.label}</span><Select value={profile} onValueChange={v=>setProfile(v as SoundProfile)}><SelectTrigger aria-label={p.label} className="mt-2"><SelectValue/></SelectTrigger><SelectContent>{SOUND_PROFILES.map(id=><SelectItem key={id} value={id}>{p.names[id]}</SelectItem>)}</SelectContent></Select>
 <div className="mt-2 flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" onClick={()=>checkFeedback(true,false,false,profile)}><Volume2/>{p.check}</Button><Button type="button" size="sm" variant="outline" onClick={()=>checkFeedback(true,false,true,profile)}><Sparkles/>{p.final}</Button></div></div></div>;
}
const skipCopy={en:'Skip reflection',sv:'Hoppa över reflektion',fr:'Passer la réflexion'} as const;
export function FocusList({state,today,onCheck,onExit,update}:{state:AppState;today:string;onCheck:(id:string)=>void;onExit:()=>void;update:(fn:(s:AppState)=>AppState)=>void}){
 const {language,challengeName}=useLanguage();const c=engagementCopy[language];const remaining=state.challenges.filter(item=>!(state.log[today]??[]).includes(item.id));
 const [text,setText]=useState(state.reflections?.[today]??'');
 const saveAndExit=()=>{if(text.trim())update(s=>saveReflection(s,today,text));onExit();};
 const drag=useRef<{y:number;active:boolean}|null>(null);const [dy,setDy]=useState(0);const [settle,setSettle]=useState<'close'|'back'|null>(null);
 const swipe={
  onTouchStart:(e:TouchEvent)=>{const el=e.target as HTMLElement;if(el.closest('textarea,input'))return;drag.current={y:e.touches[0]?.clientY??0,active:window.scrollY<=0};},
  onTouchMove:(e:TouchEvent)=>{if(!drag.current?.active)return;const d=(e.touches[0]?.clientY??0)-drag.current.y;if(d<0){drag.current.active=false;setDy(0);return;}setSettle(null);setDy(d);},
  onTouchEnd:()=>{drag.current=null;if(!dy)return;if(dy>120){setSettle('close');window.setTimeout(onExit,220);}else{setSettle('back');setDy(0);window.setTimeout(()=>setSettle(null),220);}},
 };
 const ease='transform 220ms cubic-bezier(0.32,0.72,0,1), opacity 220ms';
 const motion=settle==='close'?{transform:'translateY(100vh)',opacity:0.4,transition:ease}:settle==='back'?{transform:'translateY(0)',transition:ease}:dy?{transform:`translateY(${dy}px)`,opacity:Math.max(0.5,1-dy/600)}:undefined;
 return <main {...swipe} style={motion} className="mx-auto min-h-screen max-w-md px-5 py-8"><div aria-hidden className="mx-auto -mt-4 mb-4 h-1.5 w-12 rounded-full bg-muted-foreground/30"/><header className="flex items-center justify-between"><span className="flex items-center gap-2 text-primary"><Target className="size-4"/>45 days</span><Button variant="ghost" size="icon" aria-label={c.exit} title={c.exit} onClick={onExit}><X/></Button></header><h1 className="mt-14 text-3xl font-bold">{c.remaining}</h1><p className="mt-2 text-muted-foreground">{remaining.length} / {state.challenges.length}</p><ul className="mt-8 space-y-4">{remaining.map(item=><li key={item.id}><Button variant="outline" className="h-auto min-h-24 w-full justify-start whitespace-normal gap-4 px-5 py-6 text-left text-2xl leading-snug" onClick={()=>onCheck(item.id)}><span className="size-8 shrink-0 rounded-full border-2 border-primary"/><span className="min-w-0 break-words">{challengeName(item.name)}</span></Button></li>)}</ul>{!remaining.length&&<div role="status" className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500"><Check className="size-12 text-primary"/><p className="mt-5 text-2xl font-display">{c.complete}</p>
 <section className="mt-8"><h2 className="flex items-center gap-2 text-sm font-semibold"><NotebookPen className="size-4 text-primary"/>{c.reflection}</h2><Textarea aria-label={c.reflection} placeholder={c.placeholder} maxLength={1000} className="mt-3 min-h-28 resize-y" value={text} onChange={e=>setText(e.target.value)}/><div className="mt-4 flex flex-col gap-2"><Button onClick={saveAndExit} disabled={!text.trim()}><Check/>{c.save}</Button><Button variant="ghost" onClick={onExit}>{skipCopy[language]}</Button></div></section></div>}</main>;
}
export function CoachingAndMilestones({state,today}:{state:AppState;today:string}){
 const {language,challengeName}=useLanguage();const c=engagementCopy[language];const checkedOpen=useRef('');const [challengeId,setChallengeId]=useState<string|null>(null);const [milestoneDay,setMilestoneDay]=useState<number|null>(null);
 useEffect(()=>{
  if(!canOpenDailyCoaching(new Date().getHours()))return;
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
