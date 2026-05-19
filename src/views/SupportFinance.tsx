
import React from 'react';
import { Card, Button, Badge } from '../components/UIBlocks';
import { transactions } from '../data/mockData';
import { formatCurrency, cn } from '../utils/helpers';
import { Download, ArrowUpRight, ArrowDownLeft, ShieldCheck, PieChart, Landmark } from 'lucide-react';

export const WalletView = () => {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-coffee-satin text-warm-ivory border-none p-10 overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-xs uppercase tracking-widest opacity-60 font-bold mb-6">Total Available Balance</h3>
            <p className="text-5xl font-medium mb-12 tabular-nums tracking-tight">$12,450.00</p>
            <div className="flex gap-4">
              <Button className="bg-warm-ivory text-coffee-satin border-none flex-1 font-bold">WITHDRAW FUNDS</Button>
              <Button variant="outline" className="border-warm-ivory/20 text-warm-ivory flex-1 font-bold">ADD FUNDS</Button>
            </div>
          </div>
          <div className="absolute top-0 right-0 p-10 opacity-10">
             <Landmark size={120} />
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-soft-gray mb-4">Pending Escrow</p>
              <p className="text-2xl font-medium">$4,200.00</p>
            </div>
            <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-old-copper">
              <ShieldCheck size={12} /> FUNDS ARE SECURED
            </div>
          </Card>
          <Card className="flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-soft-gray mb-4">May Earnings</p>
              <p className="text-2xl font-medium">$8,150.00</p>
            </div>
            <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-glade-green">
              <PieChart size={12} /> +24% THIS PERIOD
            </div>
          </Card>
        </div>
      </div>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium uppercase tracking-tight">Transaction Ledger</h2>
          <Button variant="ghost" size="sm" className="text-[10px] font-bold">DOWNLOAD CSV</Button>
        </div>
        <div className="bg-white border border-coffee-satin/5 rounded-table overflow-hidden">
          <table className="w-full">
            <thead className="bg-warm-ivory/50 border-b border-coffee-satin/5">
              <tr>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-soft-gray text-left">Entity / Purpose</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-soft-gray text-left">Date</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-soft-gray text-left">Amount</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-soft-gray text-left">Status</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-soft-gray text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-coffee-satin/5">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-warm-ivory/20 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        tx.type === 'Credit' ? 'bg-glade-green/10 text-glade-green' : tx.type === 'Debit' ? 'bg-old-copper/10 text-old-copper' : 'bg-soft-gray/10 text-soft-gray'
                      )}>
                        {tx.type === 'Credit' ? <ArrowDownLeft size={16} /> : tx.type === 'Debit' ? <ArrowUpRight size={16} /> : <ShieldCheck size={16} />}
                      </div>
                      <span className="text-sm font-medium">{tx.project}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-xs text-soft-gray font-semibold">{tx.date}</td>
                  <td className={cn(
                    "px-8 py-4 text-sm font-bold tabular-nums",
                    tx.type === 'Credit' ? 'text-glade-green' : 'text-coffee-satin'
                  )}>{tx.amount}</td>
                  <td className="px-8 py-4">
                    <Badge variant={tx.status === 'Settled' ? 'default' : 'copper'}>{tx.status}</Badge>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button className="p-2 text-soft-gray hover:text-coffee-satin transition-colors">
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
