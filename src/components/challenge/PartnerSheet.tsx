import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Copy, Link2, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useLanguage } from '@/hooks/use-language';
import { engagementCopy } from '@/lib/engagement-copy';
import { partnerSnapshot } from '@/lib/engagement';
import { savePartner, revokePartner } from '@/lib/partner.functions';
import type { AppState } from '@/lib/challenge';
type Credentials = {id:string;secret:string;token:string};
const key = '45days:partner';
function randomToken() { return Array.from(crypto.getRandomValues(new Uint8Array(32))).map(n=>n.toString(16).padStart(2,'0')).join(''); }
export function PartnerSheet({state,today}:{state:AppState;today:string}) {
 const {language}=useLanguage();const c=engagementCopy[language];
 const save=useServerFn(savePartner);const revoke=useServerFn(revokePartner);
 const [credentials,setCredentials]=useState<Credentials|null>(null);const [busy,setBusy]=useState(false);const [error,setError]=useState(false);const [copied,setCopied]=useState(false);const [updated,setUpdated]=useState('');const [url,setUrl]=useState('');
 useEffect(()=>{try{const stored=JSON.parse(localStorage.getItem(key)??'null');if(stored?.id && stored?.secret && stored?.token)setCredentials(stored);}catch{}},[]);
 const payload=JSON.stringify(partnerSnapshot(state,today));
 useEffect(()=>{
  if(!credentials)return;
  setUrl(`${location.origin}/partner/${credentials.token}`);
  const sync=()=>{void save({data:{...credentials,snapshot:JSON.parse(payload)}}).then(r=>{setUpdated(r.updatedAt);setError(false);}).catch(()=>setError(true));};
  sync();const timer=window.setInterval(sync,60000);window.addEventListener('online',sync);return()=>{clearInterval(timer);window.removeEventListener('online',sync);};
 },[credentials,payload,save]);
 const create=async()=>{setBusy(true);setError(false);const next={id:crypto.randomUUID(),secret:randomToken(),token:randomToken()};try{await save({data:{...next,snapshot:partnerSnapshot(state,today)}});localStorage.setItem(key,JSON.stringify(next));setCredentials(next);}catch{setError(true);}finally{setBusy(false);}};
 return <Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" title={c.share} aria-label={c.share}><Link2/></Button></SheetTrigger><SheetContent side="bottom" className="mx-auto max-w-md max-h-[90dvh] overflow-y-auto"><SheetTitle>{c.share}</SheetTitle><SheetDescription className="mt-3 leading-relaxed">{c.privacy}</SheetDescription>
 {credentials ? <div className="mt-5 space-y-4"><p className="break-all border-b pb-3 text-sm text-muted-foreground">{url}</p><Button onClick={async()=>{try{await navigator.clipboard.writeText(url);setCopied(true);}catch{setError(true);}}}><Copy/>{copied?c.copied:c.copy}</Button><Button variant="ghost" disabled={busy} onClick={async()=>{setBusy(true);try{await revoke({data:credentials});localStorage.removeItem(key);setCredentials(null);setUrl('');}catch{setError(true);}finally{setBusy(false);}}}><Trash2/>{c.revoke}</Button>{updated && <p className="text-xs text-muted-foreground">{c.synced}: {new Date(updated).toLocaleString(language)}</p>}</div>:<Button className="mt-5" disabled={busy} onClick={create}><Link2/>{c.create}</Button>}
 {error && <div role="alert" className="mt-4 text-sm"><p>{c.error}</p>{credentials && <Button variant="ghost" onClick={async()=>{try{const r=await save({data:{...credentials,snapshot:partnerSnapshot(state,today)}});setUpdated(r.updatedAt);setError(false);}catch{setError(true);}}}><RefreshCw/>{c.retry}</Button>}</div>}
 </SheetContent></Sheet>;
}
