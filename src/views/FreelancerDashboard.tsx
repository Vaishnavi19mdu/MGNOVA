
import React from 'react';
import { DashboardLayout } from '../components/Layouts';
import { LayoutDashboard, Briefcase, MessageSquare, CreditCard, PieChart, Settings, Award, Users, Search, Target, Zap, ShieldCheck, Cpu } from 'lucide-react';
import { Card, Button, Badge, Input } from '../components/UIBlocks';
import { projects, notifications } from '../data/mockData';
import { formatCurrency, cn } from '../utils/helpers';

const FreelancerDashboard = () => {
  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/freelancer/dashboard' },
    { icon: Search, label: 'Discover', path: '/freelancer/discover' },
    { icon: Target, label: 'Applications', path: '/freelancer/applications' },
    { icon: PieChart, label: 'Milestones', path: '/freelancer/milestones' },
    { icon: CreditCard, label: 'Wallet', path: '/freelancer/wallet' },
    { icon: Award, label: 'Reputation', path: '/freelancer/reputation' },
    { icon: Settings, label: 'Settings', path: '/freelancer/settings' },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-medium mb-1">Portfolio Highlights, Marcus.</h1>
          <p className="text-soft-gray text-sm italic">You are in the top 2% of digital architects worldwide.</p>
        </div>
        <div className="flex gap-3">
          <Badge variant="gold" className="py-2 px-4 flex items-center gap-2">
            <Zap size={14} /> ELITE STATUS ACTIVE
          </Badge>
          <div className="flex items-center gap-2 px-4 py-2 bg-coffee-satin text-warm-ivory rounded-main text-xs font-bold">
            REPO SCORE: 980
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'WALLET BALANCE', value: '$12,450.00', icon: CreditCard, color: 'text-glade-green' },
          { label: 'PENDING PAYOUT', value: '$4,200.00', icon: ShieldCheck, color: 'text-old-copper' },
          { label: 'ACTIVE PROJECTS', value: '3', icon: Briefcase, color: 'text-coffee-satin' },
          { icon: Users, label: 'CLIENT VIEWS', value: '1.2k', color: 'text-rodeo-dust' }
        ].map((stat, i) => (
          <Card key={i} className="p-5">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold tracking-widest uppercase text-soft-gray">{stat.label}</span>
              <stat.icon size={14} className={stat.color} />
            </div>
            <p className="text-xl font-medium">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium uppercase tracking-tight">Current Engagements</h2>
              <Badge variant="green">3 Active Projects</Badge>
            </div>
            <div className="space-y-4">
              {projects.slice(0, 1).map((p) => (
                <Card key={p.id} className="p-8 border-l-4 border-l-glade-green">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-medium mb-1">{p.title}</h3>
                      <p className="text-xs text-soft-gray uppercase tracking-widest font-semibold">{p.client}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-soft-gray">Contract Value</p>
                      <p className="text-lg font-bold text-coffee-satin">{formatCurrency(p.budget)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {(p.milestones || []).map((m) => (
                      <div key={m.id} className="flex items-center gap-4">
                        <div className={cn(
                          "w-3 h-3 rounded-full shrink-0",
                          m.status === 'Completed' ? 'bg-glade-green' : m.status === 'In Progress' ? 'bg-old-copper' : 'bg-soft-gray/20'
                        )} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{m.label}</p>
                          <p className="text-[10px] text-soft-gray uppercase tracking-wider">{m.status}</p>
                        </div>
                        <p className="text-xs font-bold text-coffee-satin">{formatCurrency(m.amount)}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-coffee-satin/5 flex gap-4">
                    <Button variant="outline" size="sm" className="flex-1">PROJECT DETAILS</Button>
                    <Button size="sm" className="flex-1">SUBMIT WORK</Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <Card className="bg-coffee-satin text-warm-ivory overflow-hidden relative border-none">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Zap size={24} className="text-metallic-gold" />
                  <h3 className="font-medium text-lg">AI Proposal Architect</h3>
                </div>
                <p className="text-sm opacity-70 mb-8 max-w-lg">Transform raw project descriptions into structured, high-conversion proposals using our proprietary intelligence model.</p>
                <div className="flex gap-4">
                  <Input placeholder="Enter project brief URL..." className="bg-white/10 border-white/20 text-warm-ivory placeholder:text-warm-ivory/30" />
                  <Button className="bg-metallic-gold text-coffee-satin hover:bg-metallic-gold/90 shrink-0">GENERATE</Button>
                </div>
              </div>
              <div className="absolute -right-20 -bottom-20 opacity-10">
                <Cpu size={240} />
              </div>
            </Card>
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-medium mb-6">REPUTATION ANALYTICS</h2>
            <Card className="text-center p-8">
              <div className="w-24 h-24 rounded-full border-8 border-rodeo-dust mx-auto flex items-center justify-center mb-6">
                <span className="text-2xl font-bold">9.8</span>
              </div>
              <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-2">Platform Rank: #42</h4>
              <p className="text-xs text-soft-gray italic">"Exemplary communication and deadline reliability over the last 6 months."</p>
              <div className="mt-8 flex flex-col gap-2">
                <div className="flex justify-between text-[10px] font-bold uppercase text-soft-gray mb-1">
                  <span>Trust Score</span>
                  <span>100%</span>
                </div>
                <div className="h-1.5 bg-warm-ivory rounded-full overflow-hidden">
                   <div className="h-full bg-glade-green w-full" />
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-2">
                <div className="flex justify-between text-[10px] font-bold uppercase text-soft-gray mb-1">
                  <span>Growth Velocity</span>
                  <span>84%</span>
                </div>
                <div className="h-1.5 bg-warm-ivory rounded-full overflow-hidden">
                   <div className="h-full bg-metallic-gold w-[84%]" />
                </div>
              </div>
            </Card>
          </section>

          <section>
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium">RECENT ACTIVITY</h2>
                <Badge>Real-time</Badge>
             </div>
             <div className="space-y-4">
               {notifications.slice(0, 3).map(n => (
                 <div key={n.id} className="flex gap-4 items-start">
                   <div className="w-2 h-2 rounded-full bg-old-copper mt-1.5" />
                   <div>
                     <p className="text-xs font-bold text-coffee-satin uppercase tracking-tight">{n.title}</p>
                     <p className="text-[10px] text-soft-gray leading-relaxed">{n.message}</p>
                   </div>
                 </div>
               ))}
             </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FreelancerDashboard;
