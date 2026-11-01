import { describe, expect, it } from 'vitest';
import { challengeDate, computeStats, toggleCheck, type AppState } from './challenge';
import { dailyMotivation } from './motivation';
import { canOpenDailyCoaching, partnerSnapshot } from './engagement';
describe('05:00 local day boundary',()=>{
 it('does not open new daily coaching before five',()=>{
  expect(canOpenDailyCoaching(0)).toBe(false);
  expect(canOpenDailyCoaching(4)).toBe(false);
  expect(canOpenDailyCoaching(5)).toBe(true);
 });
 it('assigns midnight through 04:59 to yesterday and 05:00 to today',()=>{
  expect(challengeDate(new Date(2026,10,1,0,0))).toBe('2026-10-31');
  expect(challengeDate(new Date(2026,10,1,4,59,59))).toBe('2026-10-31');
  expect(challengeDate(new Date(2026,10,1,5,0))).toBe('2026-11-01');
 });
 it('crosses year and daylight-saving dates using local calendar arithmetic',()=>{
  expect(challengeDate(new Date(2027,0,1,4,59))).toBe('2026-12-31');
  expect(challengeDate(new Date(2026,2,29,4,59))).toBe('2026-03-28');
  expect(challengeDate(new Date(2026,9,25,5,0))).toBe('2026-10-25');
 });
 it('keeps checks, stats and partner progress on the previous day until five',()=>{
  const day=challengeDate(new Date(2026,10,2,4,59));
  const state:AppState=toggleCheck({startDate:'2026-11-01',challenges:[{id:'a',name:'Read'}],log:{}},day,'a');
  expect(state.log['2026-11-01']).toEqual(['a']);
  expect(computeStats(state,day)).toMatchObject({currentDay:1,missedDays:0,streak:1});
  expect(partnerSnapshot(state,day)).toMatchObject({date:'2026-11-01',day:1,done:1});
  expect(dailyMotivation(state,day,4,'en')?.recovery).toBeNull();
 });
 it('only acknowledges a missed yesterday after five',()=>{
  const state:AppState={startDate:'2026-11-01',challenges:[{id:'a',name:'Read'}],log:{}};
  const before=challengeDate(new Date(2026,10,2,4,59));
  const after=challengeDate(new Date(2026,10,2,5,0));
  expect(dailyMotivation(state,before,4,'en')?.recovery).toBeNull();
  expect(dailyMotivation(state,after,5,'en')?.recovery).not.toBeNull();
 });
});