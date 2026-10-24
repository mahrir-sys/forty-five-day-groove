import {describe,it,expect} from 'vitest';
import {addDays,type AppState} from './challenge';
import {coachingChallenge,milestone,partnerSnapshot,saveReflection} from './engagement';
import {dailyMotivation} from './motivation';
const state:AppState={startDate:'2026-10-01',challenges:[{id:'a',name:'Read'},{id:'b',name:'Walk'}],log:{}};
describe('engagement rules',()=>{
 for(const day of [7,23,40,45])it(`celebrates completed day ${day}`,()=>{const date=addDays('2026-10-01',day-1);expect(milestone({...state,log:{[date]:['a','b']}},date)).toBe(day);});
 it('does not celebrate an incomplete milestone',()=>expect(milestone(state,'2026-10-07')).toBeNull());
 it('does not celebrate a non-milestone day',()=>expect(milestone({...state,log:{'2026-10-08':['a','b']}},'2026-10-08')).toBeNull());
 it('coaches one specific challenge after three past misses',()=>expect(coachingChallenge({...state,log:{'2026-10-03':['b']}},'2026-10-04')?.id).toBe('a'));
 it('does not coach after only two days',()=>expect(coachingChallenge(state,'2026-10-03')).toBeNull());
 it('checked yesterday resets the consecutive misses',()=>expect(coachingChallenge({...state,log:{'2026-10-03':['a','b']}},'2026-10-04')).toBeNull());
 it('today completed challenges need no coaching',()=>expect(coachingChallenge({...state,log:{'2026-10-04':['a','b']}},'2026-10-04')).toBeNull());
 it('does not coach before or after the period',()=>{expect(coachingChallenge(state,'2026-09-30')).toBeNull();expect(coachingChallenge(state,'2026-11-15')).toBeNull();});
 it('reflections preserve checks and survive serialization',()=>{const next=saveReflection(state,'2026-10-01','A good start');expect(next.log).toBe(state.log);expect(JSON.parse(JSON.stringify(next)).reflections['2026-10-01']).toBe('A good start');});
 it('shares only streak and daily totals, never names or reflections',()=>expect(partnerSnapshot({...state,reflections:{'2026-10-01':'Private'},log:{'2026-10-01':['a']}},'2026-10-01')).toEqual({date:'2026-10-01',day:1,streak:0,done:1,total:2}));
 it('rotates recovery on successive incomplete days',()=>{for(const language of ['en','sv','fr'] as const){expect(dailyMotivation(state,'2026-10-02',7,language)?.recovery).not.toBe(dailyMotivation(state,'2026-10-03',7,language)?.recovery);}});
});
