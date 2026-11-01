import { z } from 'zod';
import { parseISODate, toISODate, type AppState } from './challenge';
import { LANGUAGES, type Language } from './i18n';
export const MAX_BACKUP_BYTES = 5_000_000;
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => toISODate(parseISODate(value)) === value);
const id = z.string().min(1).max(128);
export const appStateSchema = z.object({
 startDate: date.nullable(), firstName: z.string().trim().max(60).default(''),
 challenges: z.array(z.object({id,name:z.string().min(1).max(1000)})).max(500).refine(items=>new Set(items.map(item=>item.id)).size===items.length),
 log:z.record(date,z.array(id).max(500)), reflections:z.record(date,z.string().max(1000)).default({})
});
const schema=z.object({app:z.literal('45 days'),version:z.literal(1),state:appStateSchema,preferences:z.object({language:z.enum(LANGUAGES),sound:z.boolean(),vibration:z.boolean()})});
export type Backup={app:'45 days';version:1;state:AppState;preferences:{language:Language;sound:boolean;vibration:boolean}};
export function makeBackup(state:AppState,language:Language,sound:boolean,vibration:boolean):Backup {return schema.parse({app:'45 days',version:1,state,preferences:{language,sound,vibration}});}
export function parseBackup(text:string):Backup {if(new TextEncoder().encode(text).length>MAX_BACKUP_BYTES)throw new Error('Backup too large');return schema.parse(JSON.parse(text));}
export function downloadBackup(backup:Backup,date:string){
 const url=URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:'application/json;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download=`45-days-backup-${date}.json`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
