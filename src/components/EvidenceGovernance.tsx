import React, { useEffect, useState } from 'react';
import { apiClient } from '../lib/api.ts';
import { useI18n } from '../lib/i18n.tsx';
import { DEMO_PANEL_STORY } from '../lib/demoData.ts';
import { DemoBanner, GlassCard, LanguageSwitch, MediBeninLogo } from './MediBeninUI.tsx';

const tabs = ['rules', 'tests', 'ranking', 'impact', 'model', 'audit'] as const;
type Tab = (typeof tabs)[number];
const developerToolEnabled = import.meta.env.NEXT_PUBLIC_DEMO_MODE === 'true';
export const EvidenceGovernance: React.FC = () => {
  const { locale } = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>('rules');
  const [governance, setGovernance] = useState<any>(null);
  const [tests, setTests] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [invited, setInvited] = useState(1000);
  const [adoption, setAdoption] = useState(63.8);
  const [baseline, setBaseline] = useState(41.2);
  const [yieldRate, setYieldRate] = useState(21.8);
  const [showDeveloperTool, setShowDeveloperTool] = useState(false);
  const [simInput, setSimInput] = useState({ overallLevel: 'orange', openGapsCount: 2, maxOverdueDays: 90, accessTimeMinutes: 45, languageNeedsSupport: true, residesInUnderservedZoneC1: true, contextConsentGiven: true, missedVisitsCount: 2, reminderRank: 1 });
  const [simResult, setSimResult] = useState<any>(null);
  const isFr = locale === 'fr';
  const isAr = locale === 'ar';
  const labels: Record<Tab, string> = isFr
    ? { rules: 'Ensemble de rÃ¨gles', tests: 'RÃ©sultats des tests', ranking: 'Fonctionnement du classement', impact: 'Simulation dâ€™impact', model: 'Fiche modÃ¨le', audit: 'Journal dâ€™audit' }
    : isAr
    ? { rules: 'Ø­Ø²Ù…Ø© Ø§Ù„Ù‚ÙˆØ§Ø¹Ø¯', tests: 'Ù†ØªØ§Ø¦Ø¬ Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±', ranking: 'Ø¢Ù„ÙŠØ© ØªØ±ØªÙŠØ¨ Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ©', impact: 'Ù…Ø­Ø§ÙƒØ§Ø© Ø§Ù„Ø£Ø«Ø±', model: 'Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ù†Ù…ÙˆØ°Ø¬', audit: 'Ø³Ø¬Ù„ Ø§Ù„ØªØ¯Ù‚ÙŠÙ‚' }
    : { rules: 'Rules bundle', tests: 'Test results', ranking: 'How ranking works', impact: 'Impact simulation', model: 'Model card', audit: 'Audit log' };
  const refreshEvidence = async () => {
    setLoading(true);
    try {
      const results = await Promise.all([apiClient.getGovernanceStatus(), apiClient.runAcceptanceSuite()]);
      setGovernance(results[0]); setTests(results[1]);
    } finally { setLoading(false); }
  };
  useEffect(() => { void refreshEvidence(); }, []);
  const story = isFr ? 'Panel de dÃ©monstration de 53 patients tirÃ© dâ€™une cohorte synthÃ©tique de 6 000 personnes' : isAr ? 'Ù„ÙˆØ­Ø© ØªØ¬Ø±ÙŠØ¨ÙŠØ© ØªØ¶Ù… Ù¥Ù£ Ù…Ø±ÙŠØ¶Ù‹Ø§ Ù…Ù† Ù…Ø¬Ù…ÙˆØ¹Ø© Ø§ØµØ·Ù†Ø§Ø¹ÙŠØ© Ù…Ù† Ù¦Ù Ù Ù  Ø´Ø®Øµ' : DEMO_PANEL_STORY;
  const gain = Math.round(invited * (adoption - baseline) / 100);
  const detected = Math.round(gain * yieldRate / 1000 * 10) / 10;
  return <div className="min-h-screen ambient-mesh text-[#334155] flex flex-col"><DemoBanner/><header className="liquid-glass border-b"><div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center"><MediBeninLogo/><div className="flex gap-3 items-center"><LanguageSwitch/><a href="/" className="text-sm font-semibold">{isFr ? 'Retour' : 'Back to MediBenin'}</a></div></div></header><main className="max-w-7xl w-full mx-auto px-4 py-8 flex-1 space-y-6"><p className="text-sm text-[#475569]">{story}</p><h1 className="text-3xl font-bold text-[#0B3B3C]">{isFr ? 'Preuves et gouvernance' : isAr ? 'Ø§Ù„Ø£Ø¯Ù„Ø© ÙˆØ§Ù„Ø­ÙˆÙƒÙ…Ø©' : 'Evidence & governance'}</h1><div role="tablist" aria-label="Evidence sections" className="flex flex-wrap gap-2">{tabs.map(tab=><button key={tab} role="tab" aria-selected={activeTab===tab} onClick={()=>setActiveTab(tab)} className={'rounded-xl px-4 py-2 text-sm font-semibold border '+(activeTab===tab?'bg-[#0B3B3C] text-white':'bg-white text-[#334155]')}>{labels[tab]}</button>)}</div>{activeTab==='rules'&&<GlassCard interactive={false} title={labels.rules}><p>Version: {governance?.version||'â€”'}</p><p>Status: {governance?.signatureValid?'Signed âœ“':'Checking status'}</p><p>Review date: {governance?.reviewDate||'â€”'}</p></GlassCard>}
{activeTab==='tests'&&<GlassCard interactive={false} title={labels.tests}><p role="status">{loading?'Checkingâ€¦':tests?tests.passedCount+' / '+tests.totalCount+' passed':'No test results available'}</p><button onClick={()=>void refreshEvidence()} className="mt-4 rounded-xl bg-[#0B3B3C] text-white px-4 py-2">Re-run</button>{tests?.results?.length>0&&<ul className="mt-4 space-y-2">{tests.results.map((item:any)=><li key={item.id} className="border-b py-2"><span aria-hidden="true">{item.passed?'âœ“':'!'}</span> {item.title}</li>)}</ul>}</GlassCard>}
{activeTab==='ranking'&&<GlassCard interactive={false} title={labels.ranking}><p>The queue organizes invitations using prevention needs and practical support considerations. Urgent cases are handled separately, and records needing data stay visible.</p><p className="mt-3">Ranking stability: 93 % overlap</p></GlassCard>}
{activeTab==='impact'&&<GlassCard interactive={false} title={labels.impact}><p className="rounded-xl border border-amber-300 bg-amber-50 p-3 font-semibold">Illustrative simulation on synthetic data. Inputs are assumptions, not results.</p><div className="grid md:grid-cols-4 gap-3 mt-4">{[['Invitations',invited,setInvited],['Baseline adoption (%)',baseline,setBaseline],['Illustrative adoption (%)',adoption,setAdoption],['Illustrative yield (%)',yieldRate,setYieldRate]].map(([label,value,setter]:any)=><label key={label} className="grid gap-1">{label}<input type="number" value={value} onChange={e=>setter(Number(e.target.value))} className="border rounded-lg p-2"/></label>)}</div><p className="mt-4">Additional visits in this scenario: <strong>{gain}</strong></p><p>Illustrative additional detections: <strong>{detected}</strong></p></GlassCard>}
{activeTab==='model'&&<GlassCard interactive={false} title={labels.model}><p>Published rules structure preventive care needs. Predictive tools are used only to organize support and messages.</p><ul className="list-disc ps-5 mt-3"><li>M1 helps coordinators offer practical support.</li><li>M2 helps prepare patient communication for human review.</li><li>No machine-learning output diagnoses a patient or changes clinical rules.</li></ul></GlassCard>}
{activeTab==='audit'&&<GlassCard interactive={false} title={labels.audit}><p>Read-only view of demonstration events.</p></GlassCard>}
{developerToolEnabled&&<section className="border-t pt-5"><button className="font-semibold text-[#0B3B3C]" onClick={()=>setShowDeveloperTool(v=>!v)}>Developer tool</button>{showDeveloperTool&&<GlassCard interactive={false} title="Developer tool"><div className="grid md:grid-cols-3 gap-2">{(['overallLevel','openGapsCount','maxOverdueDays','accessTimeMinutes','missedVisitsCount','reminderRank'] as const).map(key=><label key={key}>{key}<input className="border rounded p-2 w-full" value={(simInput as any)[key]} onChange={e=>setSimInput({...simInput,[key]:key==='overallLevel'?e.target.value:Number(e.target.value)})}/></label>)}</div><button className="mt-3 rounded bg-[#0B3B3C] text-white px-4 py-2" onClick={async()=>setSimResult(await apiClient.simulateLogistics(simInput))}>Run simulation</button>{simResult&&<p className="mt-3">Priority: {simResult.simulation.priorityScoreSprio} Â· M1: {Math.round(simResult.simulation.noShowProbability*100)}%</p>}</GlassCard>}</section>}</main><footer className="bg-white border-t px-4 py-6 text-sm text-[#475569]"><p>Independent prototype built by team CareX. Not affiliated with, or endorsed by, any health authority. 100 % synthetic data.</p></footer></div>;
};
