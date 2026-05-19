
import React from 'react';
import { Card, Button, Input, Badge } from '../components/UIBlocks';
import { Settings as SettingsIcon, ShieldClose, Activity, Database, Key, Bell, Globe } from 'lucide-react';

export const SettingsView = () => {
  return (
    <div className="max-w-3xl space-y-10">
       <section>
         <h2 className="text-xl font-medium mb-6">Profile Settings</h2>
         <Card className="space-y-6">
           <div className="flex items-center gap-6 pb-6 border-b border-coffee-satin/5">
             <div className="w-20 h-20 rounded-main bg-soft-gray/10 overflow-hidden">
                <img src="https://i.pravatar.cc/150?u=marcus" alt="Marcus" />
             </div>
             <Button variant="outline" size="sm">CHANGE AVATAR</Button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Input label="Display Name" defaultValue="Marcus Thorne" />
             <Input label="Public Title" defaultValue="Full-Stack Architect" />
             <Input label="Email Address" defaultValue="marcus@thorne.io" />
             <Input label="Recovery Phone" defaultValue="+1 (555) 000-0000" />
           </div>
           <Button className="px-10">SAVE CHANGES</Button>
         </Card>
       </section>

       <section>
         <h2 className="text-xl font-medium mb-6">Security & Authentication</h2>
         <Card className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest mb-1">Two-Factor Authentication</h4>
                <p className="text-xs text-soft-gray">Secure your account with a secondary verification method.</p>
              </div>
              <Badge variant="green">ACTIVE</Badge>
            </div>
            <hr className="border-coffee-satin/5" />
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest mb-1">API Key Management</h4>
                <p className="text-xs text-soft-gray">Access MGNOVA services programmatically.</p>
              </div>
              <Button variant="outline" size="sm">MANAGE KEYS</Button>
            </div>
         </Card>
       </section>
    </div>
  );
};

export const SystemAdminView = () => {
  return (
    <div className="space-y-8">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="p-6">
            <Activity className="text-glade-green mb-4" />
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-soft-gray mb-1">Uptime</h4>
            <p className="text-2xl font-medium">99.998%</p>
         </Card>
         <Card className="p-6">
            <Database className="text-old-copper mb-4" />
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-soft-gray mb-1">Database Load</h4>
            <p className="text-2xl font-medium">14%</p>
         </Card>
         <Card className="p-6">
            <Globe className="text-coffee-satin mb-4" />
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-soft-gray mb-1">Active Nodes</h4>
            <p className="text-2xl font-medium">24 Global</p>
         </Card>
       </div>

       <section>
         <h2 className="text-xl font-medium mb-6">Activity Logs</h2>
         <Card className="p-0 overflow-hidden">
           <div className="p-6 border-b border-coffee-satin/5 bg-warm-ivory/30">
              <p className="text-[10px] font-bold uppercase tracking-widest">Platform Events (Last 10ms)</p>
           </div>
           <div className="p-6 space-y-4 font-mono text-[10px] text-soft-gray">
              <p><span className="text-glade-green">[INFO]</span> 2026-05-18 16:44:01 - User: Marcus_T successfully authenticated via OAuth.</p>
              <p><span className="text-old-copper">[WARN]</span> 2026-05-18 16:44:02 - Rate limit threshold reached for node: US-EAST-1.</p>
              <p><span className="text-coffee-satin">[SYSTEM]</span> 2026-05-18 16:44:03 - Scheduled payout process initialized for 142 accounts.</p>
              <p><span className="text-glade-green">[INFO]</span> 2026-05-18 16:44:05 - New project "The Aurelian Group" validated by AI auditor.</p>
           </div>
         </Card>
       </section>
    </div>
  );
};
