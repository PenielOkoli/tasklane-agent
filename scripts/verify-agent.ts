import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
const base = process.argv[2] || 'http://localhost:3018';
const live = process.argv.includes('--live');
const checks: { name: string; passed: boolean; detail?: unknown }[] = [];
const jar = new Map<string, string>();
let state: any;
async function request(method: string, body?: object, path = '/api/run') {
  const response = await fetch(base + path, { method, headers: { origin: base, 'content-type': 'application/json', cookie: [...jar].map(([k,v]) => `${k}=${v}`).join('; ') }, ...(body ? { body: JSON.stringify(body) } : {}) });
  for (const cookie of response.headers.getSetCookie()) { const entry = cookie.split(';')[0], index = entry.indexOf('='); jar.set(entry.slice(0,index), entry.slice(index+1)); }
  const data = await response.json(); if (data.workspace) state = data;
  return { status: response.status, data };
}
async function command(operation: string, extra: object = {}) { return request('POST', { operation, ...(!['start','reset'].includes(operation) ? {runId: state.run.id,version:state.run.version}:{}), ...extra }); }
async function reset() { const r = await command('reset',{confirmation:'RESET'}); assert.equal(r.status,200); }
async function start(scenario = 'launch', mode = 'demo', instructions = 'Review launch guidance and current tasks, then create a launch readiness checklist task for approval.') {
  const r = await command('start',{scenario,mode,instructions,consent:true}); assert.equal(r.status,200, r.data.error);
}
async function advanceToStop() {
  for(let i=0;i<12 && ['planning','running','tool_use'].includes(state.run.status);i++) { const r=await command('advance'); if(r.status!==200) break; }
}
async function check(name: string, fn: () => Promise<unknown>) { try { const detail=await fn();checks.push({name,passed:true,...(detail?{detail}:{})}); }catch(e){checks.push({name,passed:false,detail:e instanceof Error?e.message:'Failed'});} }
async function main() {
await check('pages, session and no-store boundary',async()=>{for(const path of ['/','/knowledge','/board','/guide'])assert.equal((await fetch(base+path)).status,200);const r=await request('GET');assert.equal(r.status,200);assert.equal(state.workspace.tasks.length,6);return {aiConfigured:state.configured};});
await check('practice plan, pause, refresh and resume',async()=>{await reset();await start();await command('advance');assert.equal(state.run.status,'running');assert.equal(state.run.steps.length,3);await command('pause');assert.equal(state.run.status,'paused');assert.equal((await command('advance')).status,409);await request('GET');assert.equal(state.run.status,'paused');await command('resume');assert.equal(state.run.status,'running');await command('advance');assert.equal(state.run.status,'tool_use');await command('pause');await command('resume');await command('advance');assert.equal(state.run.cursor,1);});
await check('read-only execution and approval gate',async()=>{await advanceToStop();assert.equal(state.run.status,'needs_approval');assert.equal(state.workspace.tasks.length,6);assert.equal(state.workspace.revision,0);assert.equal((await command('advance')).status,409);const r=await command('approve',{proposalId:state.run.proposalId,confirmation:''});assert.equal(r.status,200,r.data.error);assert.equal(state.run.status,'completed');assert.equal(state.workspace.tasks.length,7);return {traceEvents:state.run.trace.map((e:any)=>e.event),toolResults:state.run.steps.map((s:any)=>({tool:s.tool.toolName,result:s.result}))};});
await check('cancel invalidates pending proposal',async()=>{await reset();await start();await advanceToStop();const id=state.run.proposalId;await command('cancel');assert.equal(state.run.status,'cancelled');assert.equal(state.workspace.proposal,null);assert.equal((await command('approve',{proposalId:id,confirmation:''})).status,409);assert.equal((await command('resume')).status,409);assert.equal(state.workspace.tasks.length,6);});
await check('revision invalidates approval and clarification can be answered',async()=>{await reset();await start();await advanceToStop();const id=state.run.proposalId;await command('revise',{instructions:'List tasks without changes'});assert.equal(state.run.status,'planning');assert.equal(state.workspace.proposal,null);assert.equal((await command('approve',{proposalId:id,confirmation:''})).status,409);await command('cancel');await start('clarification');await command('advance');assert.equal(state.run.status,'blocked');assert.ok(state.run.clarification);assert.equal((await command('advance')).status,409);await command('revise',{instructions:'Prepare a launch checklist'});assert.equal(state.run.status,'planning');});
await check('failure stays safe and retry can complete',async()=>{await reset();await start('failure');await advanceToStop();assert.equal(state.run.status,'failed');assert.equal(state.workspace.revision,0);await command('retry');await advanceToStop();assert.equal(state.run.status,'needs_approval');await command('approve',{proposalId:state.run.proposalId,confirmation:''});assert.equal(state.run.status,'completed');});
await check('strict input, session isolation, consent and stale checkpoints',async()=>{await reset();assert.equal((await command('start',{instructions:'Create a task',mode:'ai',scenario:'launch',consent:false})).status,403);await start();const prior=state.run.version;await command('pause');assert.equal((await request('POST',{operation:'resume',runId:state.run.id,version:prior})).status,409);assert.equal((await command('resume',{bypassApproval:true})).status,400);assert.equal((await fetch(base+'/api/run',{method:'POST',headers:{origin:base,'content-type':'application/json'},body:JSON.stringify({operation:'cancel',runId:state.run.id,version:state.run.version})})).status,401);assert.equal((await fetch(base+'/api/run',{method:'POST',headers:{origin:'https://evil.example','content-type':'application/json'},body:'{}'})).status,403);});
if(live){
 await check('real AI plan reaches approval and completes after human decision',async()=>{await reset();await start('launch','ai');await advanceToStop();assert.equal(state.run.status,'needs_approval',state.run.error||state.run.clarification);assert.equal(state.workspace.revision,0);const planned=state.run.steps.map((s:any)=>({title:s.title,tool:s.tool}));for(let i=0;i<4 && state.run.status==='needs_approval';i++){const r=await command('approve',{proposalId:state.run.proposalId,confirmation:''});assert.equal(r.status,200,r.data.error);await advanceToStop();}assert.equal(state.run.status,'completed');assert.equal(state.workspace.tasks.length,7);return {planned,trace:state.run.trace};});
 await check('real AI unsupported request asks clarification without tools',async()=>{await reset();await start('launch','ai','Send an email to the customer about the launch.');await command('advance');assert.equal(state.run.status,'blocked',state.run.error);assert.equal(state.run.steps.length,0);assert.equal(state.workspace.revision,0);return {clarification:state.run.clarification};});
}
const output={checkedAt:new Date().toISOString(),url:base,liveRequested:live,passed:checks.every(c=>c.passed),checks};
writeFileSync(`docs/modules/07/${base.startsWith('http://localhost')?'local':'live'}-verification.json`,JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output,null,2));if(!output.passed)process.exitCode=1;

}
void main();
