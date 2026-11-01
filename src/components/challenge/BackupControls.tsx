import { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLanguage } from '@/hooks/use-language';
import { MAX_BACKUP_BYTES, downloadBackup, makeBackup, parseBackup, type Backup } from '@/lib/backup';
import { settingsCopy } from '@/lib/settings-copy';
import type { AppState } from '@/lib/challenge';
export function BackupControls({state,today,sound,vibration,onRestore}:{state:AppState;today:string;sound:boolean;vibration:boolean;onRestore:(backup:Backup)=>void}){
 const {language}=useLanguage();const c=settingsCopy[language];const input=useRef<HTMLInputElement>(null);const [pending,setPending]=useState<Backup|null>(null);
 return <section className="mt-6 border-t pt-5"><h3 className="mb-3 text-sm font-semibold">{c.backup}</h3><div className="flex flex-col gap-2"><Button variant="outline" onClick={()=>{try{downloadBackup(makeBackup(state,language,sound,vibration),today);}catch{toast.error(c.invalid);}}}><Download/>{c.export}</Button><Button variant="outline" onClick={()=>input.current?.click()}><Upload/>{c.restore}</Button></div>
 <input ref={input} type="file" accept=".json,application/json" className="hidden" aria-label={c.restore} onChange={async event=>{const file=event.target.files?.[0];event.target.value='';if(!file)return;try{if(file.size>MAX_BACKUP_BYTES)throw new Error('Too large');setPending(parseBackup(await file.text()));}catch{toast.error(c.invalid);}}}/>
 <AlertDialog open={pending!==null} onOpenChange={open=>{if(!open)setPending(null);}}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{c.confirm}</AlertDialogTitle><AlertDialogDescription>{c.warning}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{c.cancel}</AlertDialogCancel><AlertDialogAction onClick={()=>{if(!pending)return;onRestore(pending);setPending(null);toast.success(c.restored);}}>{c.restore}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></section>;
}
