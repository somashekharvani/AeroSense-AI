'use client';

import * as React from 'react';
import {
  Settings,
  Shield,
  Trash2,
  Monitor,
  Check,
  AlertTriangle,
  HardDrive,
  Info,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/lib/i18n/context';
import { useLocation } from '@/components/location/location-provider';
import { clearAllLocalData } from '@/lib/location/storage';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type GraphicsQuality = 'high' | 'medium' | 'low' | 'off';

export function SettingsDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const t = useTranslations('settings');
  const { locale } = useLanguage();
  const { savedLocations } = useLocation();

  const [graphicsQuality, setGraphicsQuality] = React.useState<GraphicsQuality>('high');
  const [isClearing, setIsClearing] = React.useState(false);
  const [clearedNotice, setClearedNotice] = React.useState(false);

  // Load graphics quality preference
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aerosense_graphics_quality') as GraphicsQuality;
      if (saved) setGraphicsQuality(saved);
    }
  }, []);

  const handleSetQuality = (q: GraphicsQuality) => {
    setGraphicsQuality(q);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aerosense_graphics_quality', q);
    }
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all locally saved family profiles and locations?')) {
      setIsClearing(true);
      await clearAllLocalData();
      setIsClearing(false);
      setClearedNotice(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-emerald-400" />
            <DialogTitle>{t('title')}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* 3D Graphics Quality Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Monitor className="h-4 w-4 text-emerald-400" />
              <span>{t('graphicsQuality')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(
                [
                  { id: 'high', label: t('qualityHigh') },
                  { id: 'medium', label: t('qualityMedium') },
                  { id: 'low', label: t('qualityLow') },
                  { id: 'off', label: t('qualityOff') },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSetQuality(item.id)}
                  className={cn(
                    'flex items-center justify-between p-2.5 rounded-lg border text-start transition-all cursor-pointer',
                    graphicsQuality === item.id
                      ? 'bg-emerald-950/70 border-emerald-600 text-white font-semibold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  )}
                >
                  <span>{item.label}</span>
                  {graphicsQuality === item.id && (
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy & Storage Section */}
          <div className="space-y-3 pt-3 border-t border-white/5">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>{t('privacy')}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{t('privacyDesc')}</p>

            <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-3 space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span>Saved Locations</span>
                <span className="font-mono text-emerald-400">{savedLocations.length} / 5</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Active Language</span>
                <span className="font-mono text-emerald-400 uppercase">{locale}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Storage Mechanism</span>
                <span className="font-mono text-slate-400">Browser IndexedDB</span>
              </div>
            </div>
          </div>

          {/* Clear Data Section */}
          <div className="pt-3 border-t border-white/5">
            {clearedNotice ? (
              <div className="rounded-lg bg-emerald-950/60 border border-emerald-700 p-3 text-xs text-emerald-300 text-center font-semibold">
                {t('dataCleared')} Reloading...
              </div>
            ) : (
              <Button
                variant="danger"
                size="md"
                onClick={handleClearData}
                disabled={isClearing}
                className="w-full gap-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>{t('clearData')}</span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
