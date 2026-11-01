import { afterEach, expect, it, vi } from 'vitest';
import { checkFeedback } from './check-feedback';
afterEach(()=>vi.unstubAllGlobals());
it('ordinary checks vibrate for 50 ms',()=>{
 const vibrate=vi.fn();vi.stubGlobal('navigator',{vibrate});checkFeedback(false,true,false);expect(vibrate).toHaveBeenCalledWith(50);
});
it('respects vibration-off preference',()=>{
 const vibrate=vi.fn();vi.stubGlobal('navigator',{vibrate});checkFeedback(false,false,false);expect(vibrate).not.toHaveBeenCalled();
});
it('uses a simultaneous major triad and an extended final fanfare',()=>{
 const starts:number[]=[];const frequencies:number[]=[];
 class AudioMock {
  currentTime=0;destination={};resume=()=>Promise.resolve();
  createOscillator(){const oscillator={frequency:{value:0},connect:vi.fn(),start:(time:number)=>{starts.push(time);frequencies.push(oscillator.frequency.value);},stop:vi.fn()};return oscillator;}
  createGain(){return {gain:{setValueAtTime:vi.fn(),exponentialRampToValueAtTime:vi.fn()},connect:vi.fn()};}
 }
 vi.stubGlobal('AudioContext',AudioMock);checkFeedback(true,false,false);
 expect(frequencies).toEqual([523.25,659.25,783.99]);expect(starts).toEqual([0,0,0]);
 frequencies.length=0;starts.length=0;checkFeedback(true,false,true);
 expect(frequencies).toEqual([523.25,659.25,783.99,1046.5,1318.51,1567.98]);expect(starts[5]).toBeCloseTo(.45);
});