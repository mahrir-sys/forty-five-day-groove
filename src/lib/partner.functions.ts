import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { setResponseHeader } from '@tanstack/react-start/server';
import { z } from 'zod';
const snapshot = z.object({ date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/), day:z.number().int().min(0).max(45), streak:z.number().int().min(0).max(45), done:z.number().int().min(0).max(1000), total:z.number().int().min(0).max(1000) }).refine(s => s.done <= s.total);
const owner = z.object({id:z.string().uuid(),secret:z.string().regex(/^[a-f0-9]{64}$/)});
async function hash(secret: string) {
 return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(secret)))).map(n=>n.toString(16).padStart(2,'0')).join('');
}
export const savePartner = createServerFn({method:'POST'}).inputValidator(owner.extend({token:z.string().regex(/^[a-f0-9]{64}$/),snapshot}).parse).handler(async ({data}) => {
 const {supabaseAdmin} = await import('@/integrations/supabase/client.server');
 const ownerHash = await hash(data.secret);
 const existing = await supabaseAdmin.from('partner_links').select('owner_hash').eq('id',data.id).maybeSingle();
 if (existing.error || (existing.data && existing.data.owner_hash !== ownerHash)) throw new Error('Not authorized');
 if (existing.data) {
  const result = await supabaseAdmin.from('partner_links').update({snapshot:data.snapshot,updated_at:new Date().toISOString()}).eq('id',data.id).eq('owner_hash',ownerHash);
  if(result.error) throw new Error('Could not sync');
 } else {
  const result = await supabaseAdmin.from('partner_links').insert({id:data.id,owner_hash:ownerHash,read_token:data.token,snapshot:data.snapshot});
  if(result.error) throw new Error('Could not create link');
 }
 return {updatedAt:new Date().toISOString()};
});
export const revokePartner = createServerFn({method:'POST'}).inputValidator(owner.parse).handler(async({data})=>{
 const {supabaseAdmin} = await import('@/integrations/supabase/client.server');
 const result = await supabaseAdmin.from('partner_links').delete().eq('id',data.id).eq('owner_hash',await hash(data.secret));
 if(result.error) throw new Error('Could not stop sharing');
 return {ok:true};
});
export const readPartner = createServerFn({method:'GET'}).inputValidator(z.object({token:z.string().regex(/^[a-f0-9]{64}$/)}).parse).handler(async({data})=>{
 setResponseHeader('Cache-Control','no-store');
 const key = process.env['SUPABASE_PUBLISHABLE_KEY'] ?? process.env['SUPABASE_ANON_KEY'];
 const url = process.env['SUPABASE_URL'];
 if(!key || !url) throw new Error('Service unavailable');
 const client = createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{const headers=new Headers(init?.headers);if(headers.get('Authorization')===`Bearer ${key}` && key.startsWith('sb_')) headers.delete('Authorization');headers.set('apikey',key);return fetch(input,{...init,headers});}}});
 const result = await client.rpc('read_partner_status',{token:data.token});
 if(result.error) throw new Error('Service unavailable');
 if(!result.data) return null;
 const parsed = z.object({snapshot,updatedAt:z.string()}).safeParse(result.data);
 return parsed.success ? parsed.data : null;
});
