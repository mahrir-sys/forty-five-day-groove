import {describe,it,expect} from 'vitest';
import {shouldAutoFocus} from './engagement';
const base={startDate:'2026-11-01',challenges:[{id:'a',name:'A'},{id:'b',name:'B'}],log:{}};
describe('auto focus',()=>{
 it('stays normal before the first check of the day',()=>expect(shouldAutoFocus(base,'2026-11-02')).toBe(false));
 it('opens focus after the first check of the day',()=>expect(shouldAutoFocus({...base,log:{'2026-11-02':['a']}},'2026-11-02')).toBe(true));
 it('stays on home when every challenge is done',()=>expect(shouldAutoFocus({...base,log:{'2026-11-02':['a','b']}},'2026-11-02')).toBe(false));
 it('resets on the next day',()=>expect(shouldAutoFocus({...base,log:{'2026-11-02':['a']}},'2026-11-03')).toBe(false));
});
