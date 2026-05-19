
import React from 'react';
import { DashboardLayout } from '../components/Layouts';
import { LayoutDashboard, Users, ShieldAlert, FileText, CreditCard, Scale, PieChart, Settings, Flag, Activity, Zap, AlertTriangle } from 'lucide-react';
import { Card, Button, Badge } from '../components/UIBlocks';
import { formatCurrency } from '../utils/helpers';

const AdminDashboard = () => {
  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: ShieldAlert, label: 'Fraud Monitor', path: '/admin/fraud' },
    { icon: FileText, label: 'Reports', path: '/admin/reports' },
    { icon: CreditCard, label: 'Transactions', path: '/admin/transactions' },
    { icon: Scale, label: 'Disputes', path: '/admin/disputes' },
    { icon: PieChart, label: 'Revenue', path: '/admin/revenue' },
    { icon: Settings, label: 'Platform Settings', path: '/admin/settings' },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-medium mb-1">Platform Integrity Center.</h1>
          <p className="text-soft-gray text-sm font-semibold tracking-widest uppercase">System Status: Operational</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-old-copper/10 text-old-copper px-4 py-2 rounded-main text-xs font-bold flex items-center gap-2">
            <AlertTriangle size={14} /> 4 PENDING DISPUTES
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Activity size={16} /> SYSTEM LOGS
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'TOTAL ECOSYSTEM GMV', value: '$1.42M', icon: PieChart, color: 'text-glade-green' },
          { label: 'PLATFORM REVENUE', value: '$284.5k', icon: CreditCard, color: 'text-coffee-satin' },
          { label: 'VERIFIED TALENT', value: '482', icon: Users, color: 'text-rodeo-dust' },
          { label: 'FRAUD ALERTS', value: '0', icon: ShieldAlert, color: 'text-glade-green' }
        ].map((stat, i) => (
          <Card key={i} className="p-6">
             <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold tracking-widest uppercase text-soft-gray">{stat.label}</span>
              <stat.icon size={14} className={stat.color} />
            </div>
            <p className="text-2xl font-medium">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium font-serif italic">Suspicious Activity Thresholds</h2>
              <Badge variant="green">Healthy</Badge>
            </div>
            <div className="overflow-hidden border border-coffee-satin/5 rounded-table bg-white">
              <table className="w-full text-left">
                <thead className="bg-warm-ivory/50 border-b border-coffee-satin/5">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-soft-gray">User / Entity</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-soft-gray">Risk Score</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-soft-gray">Type</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-soft-gray">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-coffee-satin/5">
                  {[
                    { user: 'Anon_882', risk: '24/100', type: 'Rapid Withdraw', status: 'Low' },
                    { user: 'Client_Vance', risk: '12/100', type: 'Geo-Mismatch', status: 'Negligible' },
                    { user: 'Dev_Marcus', risk: '08/100', type: 'API Spikes', status: 'Normal' }
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-warm-ivory/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-soft-gray/10 flex items-center justify-center text-[10px] font-bold">{row.user[0]}</div>
                          <span className="text-sm font-medium">{row.user}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-full h-1.5 bg-warm-ivory rounded-full overflow-hidden max-w-[100px]">
                          <div className="h-full bg-old-copper" style={{ width: row.risk.split('/')[0] + '%' }} />
                        </div>
                        <span className="text-[10px] font-bold ml-1">{row.risk}</span>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">{row.type}</td>
                      <td className="px-6 py-4">
                        <button className="text-[10px] font-bold tracking-widest uppercase text-glade-green hover:underline">Monitor</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <ShieldAlert size={20} className="text-old-copper" />
                  <h3 className="font-medium uppercase tracking-tight">Escrow Health</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold uppercase text-soft-gray">Locked Funds</span>
                    <span className="text-lg font-bold">$422,850</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold uppercase text-soft-gray">Verification Rate</span>
                    <span className="text-lg font-bold text-glade-green">99.8%</span>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <Zap size={20} className="text-metallic-gold" />
                  <h3 className="font-medium uppercase tracking-tight">AI Utilization</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold uppercase text-soft-gray">Active Agents</span>
                    <span className="text-lg font-bold">12 / 12</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold uppercase text-soft-gray">Tokens Consumed</span>
                    <span className="text-lg font-bold">1.4M</span>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-medium mb-6">REVENUE DISTRIBUTION</h2>
            <Card className="flex flex-col gap-8">
              {[
                { label: 'Enterprise Commissions', amount: '$142k', percent: 65, color: 'bg-coffee-satin' },
                { label: 'SaaS Marketplace Fees', amount: '$86k', percent: 25, color: 'bg-glade-green' },
                { label: 'Withdrawal Surcharges', amount: '$56k', percent: 10, color: 'bg-rodeo-dust' }
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                    <span className="text-sm font-bold">{item.amount}</span>
                  </div>
                  <div className="h-2 bg-warm-ivory rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </Card>
          </section>

          <Card className="bg-old-copper text-warm-ivory border-none">
            <Flag size={24} className="mb-4" />
            <h4 className="font-bold text-sm tracking-wide mb-2 uppercase">DISPUTE INTERVENTION</h4>
            <p className="text-xs opacity-70 leading-relaxed mb-6">Project #XLY-882 has reached impasse on Milestone 3. Human arbitration requested.</p>
            <Button variant="outline" className="w-full border-warm-ivory/20 text-warm-ivory hover:bg-warm-ivory/10 text-[10px] font-bold uppercase tracking-widest">ASSIGN ARBITRATOR</Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
