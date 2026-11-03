import { describe, expect, it } from 'vitest';
import { makeBackup, parseBackup } from './backup';
const state={startDate:'2026-11-01',firstName:'Mahmud',challenges:[{id:'a',name:'Read'}],log:{'2026-11-01':['a'],'2026-10-30':['removed']},reflections:{'2026-11-01':'A good day'}};
describe('local backup',()=>{
 it('restores challenges, identity, history, reflections, name and preferences',()=>{
  expect(parseBackup(JSON.stringify(makeBackup(state,'fr',false,true,'zen')))).toEqual({app:'45 days',version:1,state,preferences:{language:'fr',sound:false,vibration:true,soundProfile:'zen'}});
 });
 it('rejects malformed data and invalid calendar dates',()=>{
  expect(()=>parseBackup('{}')).toThrow();
  expect(()=>makeBackup({...state,startDate:'2026-02-30'},'en',true,true)).toThrow();
 });
 it('rejects duplicate challenge identities',()=>{
  expect(()=>makeBackup({...state,challenges:[{id:'a',name:'A'},{id:'a',name:'B'}]},'en',true,true)).toThrow();
 });
 it('does not export device credentials or private sharing capabilities',()=>{
  const extra={...state,secret:'private',partnerToken:'private'};
  expect(makeBackup(extra,'en',true,true).state).toEqual(state);
 });
});