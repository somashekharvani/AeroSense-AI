'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  Users,
  UserPlus,
  ShieldAlert,
  ShieldCheck,
  Heart,
  Cigarette,
  Activity,
  Trash2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { get, set } from 'idb-keyval';
import { useSnapshot } from '@/hooks/use-snapshot';
import { calculateExposureDose, ExposureDoseResult } from '@/engines/exposure';
import { FamilyMember } from '@/lib/validation/schemas';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DEFAULT_MEMBERS: FamilyMember[] = [
  {
    id: 'mem-1',
    nickname: 'Aarav (Child)',
    ageGroup: 'child',
    activityLevel: 'moderate',
    sensitivities: [],
  },
  {
    id: 'mem-2',
    nickname: 'Meera (Adult)',
    ageGroup: 'adult',
    activityLevel: 'light',
    sensitivities: [],
  },
  {
    id: 'mem-3',
    nickname: 'Dadaji (Elderly)',
    ageGroup: 'elderly',
    activityLevel: 'rest',
    sensitivities: ['asthma', 'cardiovascular'],
  },
];

export default function FamilyExposurePage() {
  const tNav = useTranslations('nav');
  const { data: snapshot } = useSnapshot();

  const [members, setMembers] = React.useState<FamilyMember[]>(DEFAULT_MEMBERS);
  const [newNickname, setNewNickname] = React.useState('');
  const [newAgeGroup, setNewAgeGroup] = React.useState<'child' | 'adult' | 'elderly'>('adult');
  const [newActivity, setNewActivity] = React.useState<'rest' | 'light' | 'moderate'>('light');
  const [hasAsthma, setHasAsthma] = React.useState(false);

  // Load from IndexedDB on mount
  React.useEffect(() => {
    async function loadMembers() {
      try {
        const stored = await get<FamilyMember[]>('aerosense_family_profiles');
        if (stored && Array.isArray(stored) && stored.length > 0) {
          setMembers(stored);
        }
      } catch (err) {
        console.warn('Could not read IndexedDB family profiles, using defaults');
      }
    }
    loadMembers();
  }, []);

  // Save to IndexedDB on update
  const saveMembers = async (updated: FamilyMember[]) => {
    setMembers(updated);
    try {
      await set('aerosense_family_profiles', updated);
    } catch (err) {
      console.warn('Could not persist to IndexedDB');
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNickname.trim()) return;

    const newMember: FamilyMember = {
      id: `mem-${Date.now()}`,
      nickname: newNickname.trim(),
      ageGroup: newAgeGroup,
      activityLevel: newActivity,
      sensitivities: hasAsthma ? ['asthma'] : [],
    };

    saveMembers([...members, newMember]);
    setNewNickname('');
    setHasAsthma(false);
  };

  const handleDeleteMember = (id: string) => {
    saveMembers(members.filter((m) => m.id !== id));
  };

  const currentPm25 = snapshot?.fusedAir?.pollutants?.pm25 ?? 85;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white font-display">
              {tNav('family')} — Protect Your Family
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Device-only family profiles, individualized inhaled PM2.5 dose calculations, and exposure budgeting.
          </p>
        </div>

        <div className="text-[11px] font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Device Stored (IndexedDB) • Zero Cloud PII
        </div>
      </div>

      {/* Per-Member Inhaled Dose & Exposure Budget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => {
          // Calculate exposure dose for member across typical day
          const indoorConcentration = Math.round(currentPm25 * 0.45); // Assuming 55% indoor reduction
          const doseResult: ExposureDoseResult = calculateExposureDose(member, [
            {
              id: 'seg-1',
              name: 'Outdoor Commute & Exercise',
              locationType: 'outdoor',
              activityLevel: member.activityLevel,
              durationMinutes: 150,
              pm25Concentration: currentPm25,
            },
            {
              id: 'seg-2',
              name: 'Indoor Home & School',
              locationType: 'indoor',
              activityLevel: 'rest',
              durationMinutes: 1290,
              pm25Concentration: indoorConcentration,
            },
          ]);

          const budgetPct = doseResult.dailyBudget.budgetConsumedPct;
          const isOverBudget = budgetPct > 100;

          return (
            <Card key={member.id} className="border-slate-800/80 bg-slate-900/60 flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base text-white">{member.nickname}</CardTitle>
                    <CardDescription className="text-xs capitalize">
                      {member.ageGroup} • {member.activityLevel} exertion
                      {member.sensitivities.length > 0 && (
                        <span className="text-rose-400 ml-1">
                          ({member.sensitivities.join(', ')})
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <button
                    onClick={() => handleDeleteMember(member.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    title="Remove member"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cumulative Inhaled Dose */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-400">Daily Inhaled PM2.5 Dose</span>
                    <span className="text-lg font-bold font-mono text-emerald-400">
                      {Math.round(doseResult.totalInhaledDoseUg)} µg
                    </span>
                  </div>

                  {/* Budget Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">WHO Daily Budget ({doseResult.dailyBudget.referenceBudgetUg} µg)</span>
                      <span className={`font-mono font-semibold ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {budgetPct}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isOverBudget ? 'bg-rose-500' : budgetPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, budgetPct)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Approximate Cigarette Equivalence */}
                {doseResult.approximateCigaretteEquivalent && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/30 text-xs">
                    <span className="text-amber-300 flex items-center gap-1.5">
                      <Cigarette className="h-4 w-4" /> Cigarette Equivalence:
                    </span>
                    <span className="font-mono font-bold text-amber-400">
                      ~{doseResult.approximateCigaretteEquivalent.count} / day
                    </span>
                  </div>
                )}

                <div className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/60 pt-2">
                  {isOverBudget
                    ? 'Exposure budget exceeded. Limit outdoor cardio and run HEPA filtration on sleep mode.'
                    : 'Exposure within calculated bounds. Maintain indoor air sealing during evening hours.'}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add New Family Member Card */}
      <Card className="border-slate-800/80 bg-slate-900/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-emerald-400" />
            <span>Add Family Profile</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Profiles are stored in browser IndexedDB only and are never transmitted to any external server.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Nickname</label>
              <input
                type="text"
                placeholder="e.g. Grandma, Arjun"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Age Group</label>
              <select
                value={newAgeGroup}
                onChange={(e) => setNewAgeGroup(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="child">Child (Under 18)</option>
                <option value="adult">Adult (18-64)</option>
                <option value="elderly">Elderly (65+)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Activity Level</label>
              <select
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="rest">Rest / Sedentary</option>
                <option value="light">Light Exertion</option>
                <option value="moderate">Moderate / Sports</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pb-2">
              <input
                type="checkbox"
                id="asthmaCheck"
                checked={hasAsthma}
                onChange={(e) => setHasAsthma(e.target.checked)}
                className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500"
              />
              <label htmlFor="asthmaCheck" className="text-xs text-slate-300">
                Respiratory Sensitivity
              </label>
            </div>

            <div>
              <Button type="submit" size="sm" className="w-full bg-emerald-600 hover:bg-emerald-500 text-xs">
                Add Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
