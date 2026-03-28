import React from 'react';
import { motion } from 'motion/react';
import { Heart, Flower2, CircleDot, User, Sparkles, Palette } from 'lucide-react';
import { ParticleTemplate } from './ParticleSystem';

interface UIOverlayProps {
  currentTemplate: ParticleTemplate;
  onTemplateChange: (template: ParticleTemplate) => void;
  color: string;
  onColorChange: (color: string) => void;
  handDetected: boolean;
  handCount: number;
}

const templates: { id: ParticleTemplate; icon: any; label: string }[] = [
  { id: 'heart', icon: Heart, label: 'Heart' },
  { id: 'flower', icon: Flower2, label: 'Flower' },
  { id: 'saturn', icon: CircleDot, label: 'Saturn' },
  { id: 'buddha', icon: User, label: 'Zen' },
  { id: 'fireworks', icon: Sparkles, label: 'Burst' },
];

export const UIOverlay: React.FC<UIOverlayProps> = ({
  currentTemplate,
  onTemplateChange,
  color,
  onColorChange,
  handDetected,
  handCount,
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10">
          <h1 className="text-2xl font-bold text-white tracking-tight">AURA PARTICLES</h1>
          <p className="text-white/60 text-sm">Gesture-Controlled 3D System</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 border ${
            handDetected ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${handDetected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            {handDetected ? `${handCount} Hand(s) Active` : 'No Hand Detected'}
          </div>
          <p className="text-white/40 text-[10px] uppercase tracking-widest">
            {handDetected ? 'Open hand fast for a larger burst' : 'Move hands into view'}
          </p>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-center gap-6 pointer-events-auto">
        {/* Template Selector */}
        <div className="bg-black/40 backdrop-blur-xl p-2 rounded-3xl border border-white/10 flex gap-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => onTemplateChange(t.id)}
              className={`p-4 rounded-2xl transition-all duration-300 flex flex-col items-center gap-2 group ${
                currentTemplate === t.id 
                  ? 'bg-white text-black scale-105 shadow-lg shadow-white/10' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <t.icon size={20} className={currentTemplate === t.id ? 'text-black' : 'text-white/70 group-hover:text-white'} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Color Selector */}
        <div className="bg-black/40 backdrop-blur-xl p-4 rounded-3xl border border-white/10 flex items-center gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-white/60">
              <Palette size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Aura Color</span>
            </div>
            <input
              type="color"
              value={color}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
