import { createFileRoute } from '@tanstack/react-router';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { RefreshCw, Flame, CheckCircle2 } from 'lucide-react';
import { readPartner } from '@/lib/partner.functions';
import { LanguageSelect } from '@/components/challenge/LanguageSelect';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { engagementCopy } from '@/lib/engagement-copy';
const options=(token:string)=>queryOptions({queryKey:['partner',token],queryFn:()=>readPartner({data:{token}}),refetchInterval:60000});
export const Route=createFileRoute('/partner/$token')({
 head:()=>({meta:[{title:'Partner progress – 45 days'},{name:'description',content:'Read-only daily progress shared with your accountability partner.'},{property:'og:title',content:'Partner progress – 45 days'},{property:'og:description',content:'A private link to shared daily totals and streak.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'},{name:'robots',content:'noindex, nofollow'},{name:'referrer',content:'no-referrer'}]}),
 loader:({params,context})=>context.queryClient.ensureQueryData(options(params.token)),component:PartnerPage,
 errorComponent:()=> <PartnerError/>,
});
function PartnerError(){const {language}=useLanguage();const c=engagementCopy[language];return <main className="mx-auto max-w-md p-6"><LanguageSelect/><h1 className="mt-10 text-2xl">45 days</h1><p className="mt-4">{c.unavailable}</p><Button className="mt-5" onClick={()=>location.reload()}><RefreshCw/>{c.retry}</Button></main>;}
function PartnerPage(){
 const {token}=Route.useParams();const {data,refetch,isFetching}=useSuspenseQuery(options(token));const {language}=useLanguage();const c=engagementCopy[language];
 return <main className="mx-auto max-w-md px-5 py-8"><div className="flex justify-end"><LanguageSelect/></div><p className="mt-8 text-xs uppercase text-primary">{c.readOnly}</p><h1 className="mt-3 text-4xl font-bold">45 days</h1>{data ? <><p className="mt-6 text-muted-foreground">{data.snapshot.date} · {c.day} {data.snapshot.day}/45</p><div className="my-8 border-y py-7"><Flame className="text-primary"/><p className="mt-3 text-6xl font-display font-bold">{data.snapshot.streak}</p><h2 className="mt-2 text-muted-foreground">{c.streak}</h2></div><CheckCircle2 className="text-primary"/><h2 className="mt-3 text-xl">{c.status}</h2><p className="mt-2 text-4xl font-display">{data.snapshot.done} / {data.snapshot.total}</p><p className="mt-8 text-xs text-muted-foreground">{c.synced}: {new Date(data.updatedAt).toLocaleString(language)}</p><p className="mt-2 text-sm text-muted-foreground">{c.stale}</p><Button variant="outline" className="mt-5" disabled={isFetching} onClick={()=>void refetch()}><RefreshCw/>{c.refresh}</Button></>:<p className="mt-8">{c.unavailable}</p>}</main>;
}
