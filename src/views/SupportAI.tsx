
import React from 'react';
import { Card, Button, Input, Badge } from '../components/UIBlocks';
import { Cpu, FileText, Zap, Award, Sparkles, UploadCloud, ShieldCheck } from 'lucide-react';
import { cn } from '../utils/helpers';

export const AIExperienceView = () => {
  return (
    <div className="space-y-12">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <Card className="p-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-glade-green/10 flex items-center justify-center mb-8">
              <UploadCloud size={32} className="text-glade-green" />
            </div>
            <h2 className="text-2xl font-medium mb-4">AI RESUME PARSER</h2>
            <p className="text-sm text-soft-gray mb-10 max-w-sm leading-relaxed">
              Upload your raw resume or LinkedIn PDF. Our AI will curate a premium editorial profile for the MGNOVA platform.
            </p>
            <div className="w-full border-2 border-dashed border-coffee-satin/10 rounded-main p-12 mb-8 bg-warm-ivory/30">
               <p className="text-[10px] font-bold uppercase tracking-widest text-soft-gray">Drag and drop PDF/DOCX</p>
            </div>
            <Button className="w-full">PROCESS DOCUMENT</Button>
        </Card>

        <Card className="p-10 bg-coffee-satin text-warm-ivory border-none">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles size={24} className="text-metallic-gold" />
              <h2 className="text-2xl font-medium tracking-tight">AI PROPOSAL GENERATOR</h2>
            </div>
            <div className="space-y-6">
               <Input label="Project Requirements URL" placeholder="https://mgnova.com/projects/aurelian-identity" className="bg-white/10 border-white/20 text-warm-ivory" />
               <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-warm-ivory/60 ml-1">Contextual Brief (Optional)</label>
                  <textarea 
                    className="bg-white/10 border border-white/20 rounded-input px-4 py-3 text-sm outline-none transition-all focus:border-white/40 h-32 text-warm-ivory"
                    placeholder="Provide additional details about your approach..."
                  />
               </div>
               <Button className="w-full bg-metallic-gold text-coffee-satin font-bold">CRAFT PREMIUM PROPOSAL</Button>
            </div>
        </Card>
      </section>

      <section>
        <div className="mb-8">
          <h2 className="text-2xl font-medium">REPUTATION & BADGE SYSTEM</h2>
          <p className="text-soft-gray text-sm">Badges are curated based on performance metrics and AI verification.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { name: 'Elite Contributor', icon: Award, color: 'text-metallic-gold', desc: 'Top 1% earner with 5-star rating.' },
            { name: 'Identity Veteran', icon: Zap, color: 'text-old-copper', desc: 'Over 50 projects completed in branding.' },
            { name: 'Verified Expert', icon: ShieldCheck, color: 'text-glade-green', desc: 'Identity verified & security cleared.' },
            { name: 'Fast Delivery', icon: Sparkles, color: 'text-rodeo-dust', desc: 'Average milestone turnaround < 48h.' }
          ].map((badge, i) => (
            <Card key={i} className="text-center p-8">
               <badge.icon size={48} className={cn("mx-auto mb-6 opacity-40", badge.color)} />
               <h4 className="font-bold text-xs uppercase tracking-widest mb-2">{badge.name}</h4>
               <p className="text-[10px] text-soft-gray font-semibold leading-relaxed px-4">{badge.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

