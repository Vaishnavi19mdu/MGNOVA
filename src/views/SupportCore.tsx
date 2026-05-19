
import React, { useState } from 'react';
import { Card, Button, Input, Badge } from '../components/UIBlocks';
import { Logo } from '../components/BrandKit';
import { Link } from 'react-router-dom';
import { MessageSquare, Paperclip, Send, Bell, Star, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { cn } from '../utils/helpers';

// LOGIN & REGISTER
export const AuthView = ({ mode = 'login' }: { mode?: 'login' | 'register' }) => {
  return (
    <div className="min-h-screen bg-warm-ivory flex flex-col items-center justify-center p-6">
      <Link to="/" className="mb-12">
        <Logo size="md" />
      </Link>
      <Card className="w-full max-w-md p-10">
        <h2 className="text-3xl font-medium mb-2">{mode === 'login' ? 'Welcome Back' : 'Join MGNOVA'}</h2>
        <p className="text-soft-gray text-sm mb-8 leading-relaxed">
          {mode === 'login' 
            ? 'Access the world’s most elite freelance ecosystem.' 
            : 'Apply for membership in our curated community of experts.'}
        </p>

        <div className="space-y-6">
          {mode === 'register' && <Input label="Full Name" placeholder="Julian Vance" />}
          <Input label="Email Address" placeholder="julian@mgnova.com" type="email" />
          <Input label="Password" placeholder="••••••••" type="password" />
          
          <Button className="w-full mt-4" size="lg">
            {mode === 'login' ? 'CONTINUE' : 'REQUEST ADMISSION'}
          </Button>
        </div>

        <div className="mt-8 pt-8 border-t border-coffee-satin/5 text-center">
          <p className="text-xs text-soft-gray">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
            <Link to={mode === 'login' ? '/register' : '/login'} className="text-coffee-satin font-bold uppercase tracking-widest hover:underline ml-1">
              {mode === 'login' ? 'Request Admission' : 'Log In'}
            </Link>
          </p>
        </div>
      </Card>
      
      <div className="mt-12 text-center opacity-40">
        <p className="text-[10px] font-bold tracking-widest uppercase text-coffee-satin">End-to-End Encryption Enabled</p>
      </div>
    </div>
  );
};

// MESSAGING INTERFACE
export const MessagingView = () => {
  const [activeChat, setActiveChat] = useState(0);
  
  return (
    <div className="h-[calc(100vh-160px)] flex bg-white rounded-main border border-coffee-satin/5 overflow-hidden">
      {/* Chats List */}
      <div className="w-80 border-r border-coffee-satin/5 flex flex-col">
        <div className="p-6 border-b border-coffee-satin/5">
          <h2 className="text-lg font-medium">Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {[
            { name: 'Aurelian Group', status: 'Online', last: 'The moodboards are approved.', time: '2m' },
            { name: 'Julian Vance', status: 'Offline', last: 'Can we schedule a sync for Tuesday?', time: '1h' },
            { name: 'Elena Rossi', status: 'Online', last: 'Identity guidelines attached.', time: '3h' },
          ].map((chat, i) => (
            <div 
              key={i} 
              onClick={() => setActiveChat(i)}
              className={cn(
                "p-6 cursor-pointer border-b border-coffee-satin/5 transition-all duration-300",
                activeChat === i ? "bg-warm-ivory" : "hover:bg-warm-ivory/50"
              )}
            >
              <div className="flex justify-between mb-1">
                <h4 className="text-sm font-bold text-coffee-satin mb-1">{chat.name}</h4>
                <span className="text-[10px] text-soft-gray uppercase font-bold">{chat.time}</span>
              </div>
              <p className="text-xs text-soft-gray line-clamp-1">{chat.last}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-warm-ivory/20">
        <div className="p-6 border-b border-coffee-satin/5 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-soft-gray/10 flex items-center justify-center text-xs font-bold">AG</div>
            <div>
              <h3 className="text-sm font-bold">The Aurelian Group</h3>
              <p className="text-[10px] text-glade-green font-bold uppercase tracking-wider">Project: Identity Metamorphosis</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="text-soft-gray hover:text-coffee-satin"><Bell size={18} /></button>
            <button className="text-soft-gray hover:text-coffee-satin"><MoreHorizontal size={18} /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-10 overflow-y-auto space-y-8">
           <div className="flex gap-4">
             <div className="w-8 h-8 rounded-full bg-coffee-satin/5 flex items-center justify-center text-[10px] font-bold">AG</div>
             <div className="bg-white p-4 rounded-secondary rounded-tl-none border border-coffee-satin/5 max-w-lg">
                <p className="text-sm leading-relaxed">The moodboards are approved. We'd like to move forward with Concept B immediately. When can we see the first digital drafts?</p>
                <div className="flex justify-end mt-2"><span className="text-[10px] text-soft-gray uppercase font-bold">10:42 AM</span></div>
             </div>
           </div>
           
           <div className="flex gap-4 flex-row-reverse">
             <div className="w-8 h-8 rounded-full bg-glade-green text-warm-ivory flex items-center justify-center text-[10px] font-bold">MS</div>
             <div className="bg-coffee-satin text-warm-ivory p-4 rounded-secondary rounded-tr-none max-w-lg">
                <p className="text-sm leading-relaxed">Excellent news. I'll begin rendering the vector primitives tomorrow morning. Expected delivery for Milestone 2 is Friday EOD.</p>
                <div className="flex justify-end mt-2"><span className="text-[10px] opacity-50 uppercase font-bold">10:45 AM</span></div>
             </div>
           </div>
        </div>

        {/* Input Bar */}
        <div className="p-6 bg-white border-t border-coffee-satin/5">
          <div className="flex items-center gap-4 bg-warm-ivory/50 p-2 rounded-input border border-coffee-satin/5">
            <button className="p-2 text-soft-gray hover:text-coffee-satin"><Paperclip size={18} /></button>
            <input type="text" placeholder="Type a message..." className="flex-1 bg-transparent border-none outline-none text-sm p-2" />
            <Button size="sm" className="rounded-secondary"><Send size={14} /></Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// PROFILE / PROJECT DETAILS VIEW (REUSABLE UI)
export const DetailViewLayout = ({ children, title, subtitle, badge }: { children: React.ReactNode, title: string, subtitle: string, badge?: string }) => {
  return (
    <div className="min-h-screen pt-40 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/client/dashboard" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-soft-gray mb-10 hover:text-coffee-satin transition-colors">
          <ArrowLeft size={12} /> Back to dashboard
        </Link>
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-medium mb-3">{title}</h1>
            <p className="text-soft-gray font-semibold text-sm uppercase tracking-widest">{subtitle}</p>
          </div>
          {badge && <Badge variant="gold" className="py-2 px-4">{badge}</Badge>}
        </div>
        {children}
      </div>
    </div>
  );
};
