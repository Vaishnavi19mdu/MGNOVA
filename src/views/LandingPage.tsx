import React from 'react';
import { motion } from 'motion/react';
import { GlobalHeader } from '../components/GlobalHeader';
import { GlobalFooter } from '../components/GlobalFooter';
import { Button, Section, Card, Badge } from '../components/UIBlocks';
import { freelancers } from '../data/mockData';
import { ArrowRight, Shield, Zap, Target, Cpu, TrendingUp, Award, Gem, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="bg-warm-ivory">
      <GlobalHeader />

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center lg:text-left"
          >
            <Badge variant="gold" className="mb-6">Curated Ecosystem</Badge>
            <h1 className="text-5xl lg:text-7xl font-medium text-coffee-satin leading-[1.1] mb-8 uppercase tracking-tight">
              ELITE FREELANCE TALENT,<br />
              <span className="text-glade-green italic">CURATED</span> FOR BOLD VISIONS.
            </h1>
            <p className="text-soft-gray text-lg lg:text-xl max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed font-medium">
              Connect with exceptional independent professionals, premium businesses,
              and milestone-driven workflows built for modern high-stakes collaboration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/register">
                <Button size="lg" className="rounded-full px-10 tracking-widest font-bold">ENTER PLATFORM</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg" className="rounded-full px-10 tracking-widest font-bold">EXPLORE NETWORK</Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex-1 relative"
          >
            <div className="relative z-10 bg-white p-8 rounded-main border border-coffee-satin/5 shadow-2xl">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-coffee-satin/5">
                <h3 className="font-bold text-[10px] tracking-widest uppercase text-soft-gray">Active Engagement — #XLY-882</h3>
                <Badge variant="gold" className="px-3">PREMIUM</Badge>
              </div>
              <div className="space-y-8">
                {[
                  { label: 'Strategic Roadmap', value: 100, status: 'Finalized' },
                  { label: 'Cloud Infrastructure', value: 82, status: 'In Deployment' },
                  { label: 'Security Audit', value: 0, status: 'Pending' }
                ].map((item, i) => (
                  <div key={i} className="group">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-3">
                      <span className="text-coffee-satin">{item.label}</span>
                      <span className="text-glade-green">{item.status}</span>
                    </div>
                    <div className="h-1 bg-warm-ivory rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1.5, delay: i * 0.3 }}
                        className="h-full bg-coffee-satin"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Stats */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 z-20 bg-coffee-satin text-warm-ivory p-8 rounded-main shadow-premium border border-white/10"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 opacity-50">Liquidity Secured</p>
              <p className="text-3xl font-medium tracking-tight">$2.4M+</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-5 z-0 bg-rodeo-dust text-coffee-satin p-6 rounded-main shadow-lg"
            >
              <Shield size={24} className="mb-2" />
              <p className="text-xs font-bold leading-tight uppercase tracking-wider">Escrow<br />Integrity</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-12 border-y border-coffee-satin/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-40 grayscale">
          {['AURELIAN', 'NEXO CAPITAL', 'STELLARIS', 'VANTAGE', 'PRIMROSE'].map((brand) => (
            <span key={brand} className="text-xl font-bold tracking-[0.3em]">{brand}</span>
          ))}
        </div>
      </section>

      {/* Featured Freelancers */}
      <Section
        title="THE CURATED LIST"
        subtitle="We don't just host talent; we curate excellence. Only the top 2% of independent professionals are selected for MGNOVA."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {freelancers.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full flex flex-col p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-main overflow-hidden border border-coffee-satin/10">
                    <img src={f.avatar} alt={f.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium">{f.name}</h4>
                    <p className="text-xs text-soft-gray uppercase tracking-wider">{f.role}</p>
                    <div className="flex gap-1 mt-2">
                      {Array(5).fill(0).map((_, i) => (
                        <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < Math.floor(f.rating) ? 'bg-metallic-gold' : 'bg-soft-gray/20'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-soft-gray leading-relaxed mb-6 flex-1">{f.bio}</p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {f.skills.map(s => <Badge key={s} className="opacity-70">{s}</Badge>)}
                </div>
                <div className="pt-6 border-t border-coffee-satin/5 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-soft-gray">Earnings</p>
                    <p className="text-sm font-bold text-coffee-satin">{f.earnings}</p>
                  </div>
                  <Badge variant="gold">{f.badge}</Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/freelancer/discover" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-coffee-satin hover:gap-4 transition-all">
            Browse All Elite Talent <ArrowRight size={14} />
          </Link>
        </div>
      </Section>

      {/* Workflow Section */}
      <section id="how-it-works" className="bg-white py-32 px-6 border-y border-coffee-satin/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <Badge variant="green" className="mb-4">Ecosystem Architecture</Badge>
            <h2 className="text-4xl lg:text-5xl font-medium uppercase tracking-tight">Cinematic Collaboration</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 relative">
            {/* Vertical Line for Desktop */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-coffee-satin/10 -translate-x-1/2">
              <motion.div
                style={{ originY: 0 }}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="w-full h-full bg-coffee-satin/40"
              />
            </div>

            {/* Clients Side */}
            <div className="space-y-24 lg:pr-20">
              <div className="flex flex-col items-center lg:items-end text-center lg:text-right">
                <h3 className="text-2xl font-medium mb-12 italic text-soft-gray uppercase tracking-widest">For Strategic Partners</h3>
                <div className="space-y-12 w-full">
                  {[
                    { step: '01', title: 'Post Project', icon: Target, desc: 'Define your vision with our structured requirements builder.' },
                    { step: '02', title: 'Hire Talent', icon: Users, desc: 'Connect with curated professionals who match your exact needs.' },
                    { step: '03', title: 'Release Milestones', icon: Shield, desc: 'Pay only when predefined milestones are met and approved.' }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className="group relative flex flex-col items-center lg:items-end"
                    >
                      <Card className="max-w-md w-full bg-warm-ivory/20 group-hover:bg-white transition-colors duration-500">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-bold text-glade-green tracking-[0.3em]">{item.step}</span>
                          <item.icon size={16} className="text-soft-gray opacity-40" />
                        </div>
                        <h4 className="font-bold text-xs tracking-widest mb-2 uppercase">{item.title}</h4>
                        <p className="text-xs text-soft-gray leading-relaxed mb-0">{item.desc}</p>
                      </Card>
                      <div className="hidden lg:block absolute -right-[88px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-coffee-satin/10 bg-warm-ivory z-20 group-hover:border-coffee-satin group-hover:bg-coffee-satin transition-all duration-500 shadow-premium" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Talent Side */}
            <div className="space-y-24 lg:pl-20 mt-24 lg:mt-64">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <h3 className="text-2xl font-medium mb-12 italic text-soft-gray uppercase tracking-widest">For Elite Talent</h3>
                <div className="space-y-12 w-full">
                  {[
                    { step: '01', title: 'Build Profile', icon: Award, desc: 'Showcase your portfolio in an editorial, high-conversion layout.' },
                    { step: '02', title: 'Apply with AI', icon: Cpu, desc: 'Generate premium proposals optimized for high-value contracts.' },
                    { step: '03', title: 'Get Paid Securely', icon: Zap, desc: 'Withdraw earnings instantly via our global fintech infrastructure.' }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: (i * 0.2) + 0.3 }}
                      className="group relative flex flex-col items-center lg:items-start"
                    >
                      <Card className="max-w-md w-full bg-white group-hover:bg-warm-ivory/20 transition-colors duration-500">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-bold text-old-copper tracking-[0.3em]">{item.step}</span>
                          <item.icon size={16} className="text-soft-gray opacity-40" />
                        </div>
                        <h4 className="font-bold text-xs tracking-widest mb-2 uppercase">{item.title}</h4>
                        <p className="text-xs text-soft-gray leading-relaxed mb-0">{item.desc}</p>
                      </Card>
                      <div className="hidden lg:block absolute -left-[88px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-coffee-satin/10 bg-warm-ivory z-20 group-hover:border-coffee-satin group-hover:bg-coffee-satin transition-all duration-500 shadow-premium" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-glade-green/5 blur-[120px] pointer-events-none opacity-50" />
        <div className="absolute bottom-0 left-0 w-1/3 h-full bg-old-copper/5 blur-[120px] pointer-events-none opacity-50" />
      </section>

      {/* AI Features */}
      <Section
        title="AI-POWERED INTELLIGENCE"
        subtitle="MGNOVA leverages machine learning to automate the tedious and amplify the strategic."
        className="bg-warm-ivory"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Resume Parsing', desc: 'Auto-extract skills and experience into a premium profile layout.', color: 'glade-green' },
            { title: 'Proposal Generator', desc: 'AI-assisted drafting for compelling, winning project bids.', color: 'rodeo-dust' },
            { title: 'Fraud Detection', desc: 'Enterprise-grade risk analysis for every single transaction.', color: 'old-copper' },
            { title: 'Smart Match', desc: 'Predictive talent matching based on project complexity.', color: 'metallic-gold' }
          ].map((feat, i) => (
            <Card key={i} className="hover:border-coffee-satin/20">
              <div className="w-10 h-10 rounded-lg bg-coffee-satin/5 flex items-center justify-center mb-6">
                <Cpu size={18} className="text-coffee-satin" />
              </div>
              <h4 className="font-bold text-xs uppercase tracking-widest mb-3">{feat.title}</h4>
              <p className="text-xs text-soft-gray border-l-2 border-coffee-satin/10 pl-3 leading-relaxed">{feat.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-coffee-satin text-warm-ivory text-center">
        <div className="max-w-4xl mx-auto">
          <Gem size={48} className="mx-auto mb-10 text-metallic-gold" />
          <h2 className="text-4xl lg:text-5xl font-medium mb-8 leading-tight">READY TO REDEFINE YOUR PROFESSIONAL FREEDOM?</h2>
          <p className="text-soft-gray text-lg mb-12 max-w-2xl mx-auto">
            Join the most exclusive freelance ecosystem on the web.
            Apply to become a verified MGNOVA professional or hire elite talent today.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-glade-green hover:bg-glade-green/90 px-12">I AM HIRING</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg" className="border-warm-ivory/20 text-warm-ivory hover:bg-warm-ivory/5 px-12">I AM A FREELANCER</Button>
            </Link>
          </div>
        </div>
      </section>

      <GlobalFooter />
    </div>
  );
};

export default LandingPage;