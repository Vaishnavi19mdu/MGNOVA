
import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '../components/Layouts';
import { LayoutDashboard, Briefcase, MessageSquare, CreditCard, PieChart, ShieldCheck, Settings, Award, Users, Plus, TrendingUp, Clock, Filter, ChevronDown, SortAsc } from 'lucide-react';
import { Card, Button, Badge } from '../components/UIBlocks';
import { projects, notifications } from '../data/mockData';
import { formatCurrency, cn } from '../utils/helpers';

const ClientDashboard = () => {
  const [localProjects, setLocalProjects] = React.useState(projects);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterBudget, setFilterBudget] = useState('All');
  const [filterTimeline, setFilterTimeline] = useState('All');
  const [sortBy, setSortBy] = useState('deadline');

  const updateMilestoneStatus = (projectId: string, milestoneId: string, newStatus: string) => {
    setLocalProjects(prev => prev.map(p => {
      if (p.id === projectId && p.milestones) {
        return {
          ...p,
          milestones: p.milestones.map(m => m.id === milestoneId ? { ...m, status: newStatus } : m)
        };
      }
      return p;
    }));
  };

  const parseBudget = (budgetStr: string) => {
    return parseInt(budgetStr.replace(/[^0-9]/g, ''));
  };

  const filteredAndSortedProjects = useMemo(() => {
    let result = [...localProjects];

    // Status Filter
    if (filterStatus !== 'All') {
      result = result.filter(p => p.status === filterStatus);
    }

    // Budget Filter
    if (filterBudget !== 'All') {
      result = result.filter(p => {
        const amount = parseBudget(p.budget);
        if (filterBudget === 'Low') return amount < 10000;
        if (filterBudget === 'Medium') return amount >= 10000 && amount <= 20000;
        if (filterBudget === 'High') return amount > 20000;
        return true;
      });
    }

    // Timeline Filter
    if (filterTimeline !== 'All') {
      const today = new Date('2026-05-18'); // Using current context date
      result = result.filter(p => {
        const deadline = new Date(p.deadline);
        const diffDays = (deadline.getTime() - today.getTime()) / (1000 * 3600 * 24);
        if (filterTimeline === 'Urgent') return diffDays <= 30;
        if (filterTimeline === 'Upcoming') return diffDays > 30 && diffDays <= 90;
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'budget') {
        return parseBudget(b.budget) - parseBudget(a.budget);
      }
      if (sortBy === 'deadline') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      return 0;
    });

    return result;
  }, [localProjects, filterStatus, filterBudget, sortBy]);

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/client/dashboard' },
    { icon: Briefcase, label: 'Projects', path: '/client/projects' },
    { icon: Award, label: 'Milestones', path: '/client/milestones' },
    { icon: MessageSquare, label: 'Messages', path: '/client/messages' },
    { icon: CreditCard, label: 'Payments', path: '/client/payments' },
    { icon: PieChart, label: 'Analytics', path: '/client/analytics' },
    { icon: Settings, label: 'Settings', path: '/client/settings' },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-medium mb-1">Welcome back, Sophia.</h1>
          <p className="text-soft-gray text-sm italic">"Excellence is not an act, but a habit." — Aristotle</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus size={18} /> POST NEW PROJECT
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'ACTIVE PROJECTS', value: '4', icon: Briefcase, color: 'text-glade-green' },
          { label: 'PENDING MILESTONES', value: '7', icon: Clock, color: 'text-old-copper' },
          { label: 'TOTAL INVESTED', value: '$84.2k', icon: CreditCard, color: 'text-coffee-satin' },
        ].map((stat, i) => (
          <Card key={i} className="flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold tracking-widest uppercase text-soft-gray">{stat.label}</span>
              <stat.icon size={16} className={stat.color} />
            </div>
            <p className="text-2xl font-medium">{stat.value}</p>
            <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-glade-green">
              <TrendingUp size={10} /> +12% FROM LAST MONTH
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-6">
              <div>
                <h2 className="text-xl font-medium mb-1">ACTIVE PROJECTS & MILESTONES</h2>
                <p className="text-[10px] font-bold text-soft-gray uppercase tracking-widest">Managing {filteredAndSortedProjects.length} strategic engagements</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 bg-white/40 p-2 rounded-full border border-coffee-satin/5 backdrop-blur-sm">
                <div className="flex items-center gap-2 px-3 border-r border-coffee-satin/10">
                  <Filter size={12} className="text-soft-gray" />
                  <select 
                    className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="All">All Status</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Application Phase">Applications</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 px-3 border-r border-coffee-satin/10">
                  <CreditCard size={12} className="text-soft-gray" />
                  <select 
                    className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer"
                    value={filterBudget}
                    onChange={(e) => setFilterBudget(e.target.value)}
                  >
                    <option value="All">All Budgets</option>
                    <option value="Low">&lt; $10k</option>
                    <option value="Medium">$10k - $20k</option>
                    <option value="High">&gt; $20k</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 px-3 border-r border-coffee-satin/10">
                  <Clock size={12} className="text-soft-gray" />
                  <select 
                    className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer"
                    value={filterTimeline}
                    onChange={(e) => setFilterTimeline(e.target.value)}
                  >
                    <option value="All">All Time</option>
                    <option value="Urgent">Next 30 Days</option>
                    <option value="Upcoming">Next 90 Days</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 px-3">
                  <SortAsc size={12} className="text-soft-gray" />
                  <select 
                    className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="deadline">Next Deadline</option>
                    <option value="budget">Highest Budget</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {filteredAndSortedProjects.length === 0 ? (
                <Card className="py-20 text-center border-dashed">
                  <p className="text-sm text-soft-gray italic">No projects found matching these criteria.</p>
                  <Button variant="ghost" size="sm" className="mt-4" onClick={() => { setFilterStatus('All'); setFilterBudget('All'); setFilterTimeline('All'); }}>Clear Filters</Button>
                </Card>
              ) : (
                filteredAndSortedProjects.map((p) => (
                <Card key={p.id} className="p-8 hover:border-coffee-satin/10 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-medium mb-1">{p.title}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-soft-gray">Client: {p.client} — Deadline: {p.deadline}</p>
                    </div>
                    <Badge variant={p.status === 'In Progress' ? 'green' : 'default'}>{p.status}</Badge>
                  </div>
                  
                  {p.milestones && (
                    <div className="space-y-4 pt-6 border-t border-coffee-satin/5">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-coffee-satin/60 mb-4 px-2">Project Milestones</h4>
                      {p.milestones.map((m) => (
                        <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-warm-ivory/30 rounded-secondary border border-coffee-satin/5 group">
                          <div className="mb-2 sm:mb-0">
                            <p className="text-sm font-medium">{m.label}</p>
                            <p className="text-[10px] text-soft-gray font-bold uppercase tracking-wider">{m.amount} — Due: June 15</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={m.status === 'Completed' ? 'green' : m.status === 'In Progress' ? 'copper' : 'default'}>
                              {m.status}
                            </Badge>
                            <select 
                              className="bg-white/50 border border-coffee-satin/10 rounded-sm text-[10px] font-bold uppercase p-1 outline-none opacity-0 group-hover:opacity-100 transition-opacity"
                              value={m.status}
                              onChange={(e) => updateMilestoneStatus(p.id, m.id, e.target.value)}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-8 flex justify-between items-center">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-warm-ivory overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?u=${i + 20}`} alt="T" />
                          </div>
                        ))}
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-coffee-satin flex items-center justify-center text-[8px] font-bold text-warm-ivory">+2</div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-soft-gray">Approved Budget</p>
                      <p className="text-xl font-bold text-coffee-satin">{formatCurrency(p.budget)}</p>
                    </div>
                  </div>
                </Card>
              )))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-6">REVENUE FLOW ANALYTICS</h2>
            <Card className="h-64 flex items-center justify-center text-soft-gray bg-white/50 border-dashed border-2 border-coffee-satin/10">
              <div className="text-center">
                <PieChart size={32} className="mx-auto mb-4 opacity-20" />
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold">Predictive Market Insights Loading</p>
              </div>
            </Card>
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-medium mb-6">NOTIFICATIONS</h2>
            <div className="space-y-4">
              {notifications.map((n) => (
                <div key={n.id} className="group p-4 bg-white border border-coffee-satin/5 rounded-secondary transition-all hover:border-glade-green/30">
                  <div className="flex justify-between mb-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider">{n.title}</h4>
                    <span className="text-[10px] text-soft-gray">{n.time}</span>
                  </div>
                  <p className="text-xs text-soft-gray line-clamp-2 leading-relaxed">{n.message}</p>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-4 text-[10px] font-bold uppercase tracking-widest">CLEAR ALL</Button>
          </section>

          <Card className="bg-glade-green text-warm-ivory border-none">
            <Award size={24} className="mb-4" />
            <h4 className="font-bold text-sm tracking-wide mb-2 uppercase">PREMIUM SUPPORT</h4>
            <p className="text-xs opacity-70 leading-relaxed mb-6">Your dedicated account manager is online. Need help with a milestone?</p>
            <Button variant="outline" className="w-full border-warm-ivory/20 text-warm-ivory hover:bg-warm-ivory/10 text-[10px] font-bold uppercase tracking-widest">START CONSULTATION</Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
