'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight, ArrowDownRight, Download, Filter, Plus,
  Shield, Zap, Clock, CheckCircle, AlertCircle, RefreshCw,
  Wallet, Check, Send,
} from 'lucide-react';
import {
  C, s,
  IndianTransaction, MilestonePayment,
  INDIAN_TRANSACTIONS, INDIAN_MILESTONES, INDIAN_INVOICES, BANKS,
  fmtINR, genTxnId, nowTs,
} from './types-and-data';
import { Modal } from './shared-components';
import { Badge, Divider } from './shared-components';

// ─── jsPDF loader (CDN) ───────────────────────────────────────────────────────
async function loadJsPDF(): Promise<any> {
  if ((window as any).jspdf) return (window as any).jspdf.jsPDF;
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = () => resolve((window as any).jspdf.jsPDF);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ─── PDF generators ───────────────────────────────────────────────────────────
async function downloadTransactionReceipt(tx: IndianTransaction) {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ unit: 'mm', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 0;

  // Header band
  doc.setFillColor(42, 33, 25); // C.coffee dark
  doc.rect(0, 0, pageW, 44, 'F');

  doc.setTextColor(247, 243, 238);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('MG Nova', margin, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 170, 155);
  doc.text('Freelancer Platform · Payment Receipt', margin, 27);

  doc.setFontSize(9);
  doc.setTextColor(120, 110, 95);
  doc.text(`Generated: ${nowTs()}`, margin, 38);

  y = 60;

  // Status badge
  const isCredit = tx.type === 'credit';
  doc.setFillColor(isCredit ? 34 : 205, isCredit ? 139 : 90, isCredit ? 34 : 20);
  doc.roundedRect(margin, y - 6, 38, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(tx.status === 'success' ? '✓ SUCCESS' : '⏳ PENDING', margin + 4, y + 1);

  y += 14;

  // Amount
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isCredit ? 34 : 150, isCredit ? 139 : 50, isCredit ? 34 : 20);
  doc.text(tx.amt, margin, y + 10);
  y += 22;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 90, 80);
  doc.text(tx.desc, margin, y);
  y += 12;

  // Divider
  doc.setDrawColor(220, 210, 200);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageW - margin, y);
  y += 12;

  // Details table
  const rows: [string, string][] = [
    ['Transaction ID', tx.id],
    ['Date & Time',    tx.date],
    ['Payment Via',    tx.via],
    ['Type',           tx.type === 'credit' ? 'Credit (Received)' : 'Debit (Withdrawn)'],
    ['Status',         tx.status.toUpperCase()],
  ];

  doc.setFontSize(10);
  rows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 70, 60);
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 35, 30);
    doc.text(value, margin + 55, y);
    y += 10;
  });

  y += 6;
  doc.setDrawColor(220, 210, 200);
  doc.line(margin, y, pageW - margin, y);
  y += 12;

  // Footer note
  doc.setFontSize(8);
  doc.setTextColor(140, 130, 115);
  doc.text('This is a computer-generated receipt and does not require a signature.', margin, y);
  doc.text('MG Nova Pvt. Ltd. · CIN: U72900KA2024PTC123456 · GSTIN: 29ABCDE1234F1Z5', margin, y + 6);
  doc.text('support@mgnova.in · www.mgnova.in', margin, y + 12);

  // Bottom accent
  doc.setFillColor(34, 139, 34);
  doc.rect(0, doc.internal.pageSize.getHeight() - 4, pageW, 4, 'F');

  doc.save(`Receipt_${tx.id}.pdf`);
}

async function downloadWithdrawalReceipt(
  amt: number, bank: typeof BANKS[0], txnId: string, ts: string
) {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 0;

  doc.setFillColor(42, 33, 25);
  doc.rect(0, 0, pageW, 44, 'F');
  doc.setTextColor(247, 243, 238);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('MG Nova', margin, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 170, 155);
  doc.text('Freelancer Platform · Withdrawal Receipt', margin, 27);
  doc.setFontSize(9);
  doc.setTextColor(120, 110, 95);
  doc.text(`Generated: ${ts}`, margin, 38);

  y = 60;

  doc.setFillColor(150, 50, 20);
  doc.roundedRect(margin, y - 6, 38, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('WITHDRAWAL', margin + 4, y + 1);

  y += 14;
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(150, 50, 20);
  doc.text(`-₹${fmtINR(amt)}`, margin, y + 10);
  y += 22;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 90, 80);
  doc.text(`Transfer to ${bank.name} — ${bank.acno}`, margin, y);
  y += 12;

  doc.setDrawColor(220, 210, 200);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageW - margin, y);
  y += 12;

  const rows: [string, string][] = [
    ['Reference ID',   txnId],
    ['Date & Time',    ts],
    ['Bank',           bank.name],
    ['Account No.',    bank.acno],
    ['IFSC Code',      bank.ifsc],
    ['Transfer Mode',  'IMPS'],
    ['Status',         'SUCCESS'],
  ];

  doc.setFontSize(10);
  rows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 70, 60);
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 35, 30);
    doc.text(value, margin + 55, y);
    y += 10;
  });

  y += 6;
  doc.setDrawColor(220, 210, 200);
  doc.line(margin, y, pageW - margin, y);
  y += 12;

  doc.setFontSize(8);
  doc.setTextColor(140, 130, 115);
  doc.text('Funds typically reflect in your bank within 30 minutes via IMPS.', margin, y);
  doc.text('This is a computer-generated document. MG Nova Pvt. Ltd.', margin, y + 6);
  doc.text('GSTIN: 29ABCDE1234F1Z5 · support@mgnova.in', margin, y + 12);

  doc.setFillColor(150, 50, 20);
  doc.rect(0, doc.internal.pageSize.getHeight() - 4, pageW, 4, 'F');

  doc.save(`Withdrawal_${txnId}.pdf`);
}

async function downloadInvoicePDF(inv: {
  id: string; proj: string; client: string; gstin: string; amt: string;
}) {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 0;

  // Header
  doc.setFillColor(42, 33, 25);
  doc.rect(0, 0, pageW, 50, 'F');
  doc.setTextColor(247, 243, 238);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('MG Nova', margin, 20);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 170, 155);
  doc.text('Freelancer Platform', margin, 30);
  doc.setFontSize(9);
  doc.setTextColor(120, 110, 95);
  doc.text('GSTIN: 29ABCDE1234F1Z5 · CIN: U72900KA2024PTC123456', margin, 40);

  // TAX INVOICE label top-right
  doc.setTextColor(34, 139, 34);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', pageW - margin - 42, 22);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 170, 155);
  doc.text(`Invoice No: ${inv.id}`, pageW - margin - 42, 32);
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageW - margin - 42, 40);

  y = 62;

  // Bill To
  doc.setFillColor(248, 244, 239);
  doc.roundedRect(margin, y, pageW - margin * 2, 32, 3, 3, 'F');
  doc.setTextColor(100, 90, 80);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO', margin + 6, y + 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(42, 33, 25);
  doc.text(inv.client, margin + 6, y + 17);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 90, 80);
  doc.text(`GSTIN: ${inv.gstin}`, margin + 6, y + 25);

  y += 44;

  // Line items table header
  doc.setFillColor(42, 33, 25);
  doc.rect(margin, y, pageW - margin * 2, 10, 'F');
  doc.setTextColor(247, 243, 238);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', margin + 4, y + 7);
  doc.text('HSN', margin + 100, y + 7);
  doc.text('Rate', margin + 120, y + 7);
  doc.text('GST', margin + 138, y + 7);
  doc.text('Amount', pageW - margin - 22, y + 7, { align: 'right' });
  y += 10;

  // Line item
  const rawAmt = parseFloat(inv.amt.replace(/[₹,]/g, ''));
  const baseAmt = rawAmt / 1.18;
  const gstAmt = rawAmt - baseAmt;

  doc.setFillColor(252, 249, 245);
  doc.rect(margin, y, pageW - margin * 2, 14, 'F');
  doc.setTextColor(42, 33, 25);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(inv.proj, margin + 4, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 90, 80);
  doc.text('Freelance software / consulting services', margin + 4, y + 11);

  doc.setFontSize(9);
  doc.setTextColor(42, 33, 25);
  doc.text('998314', margin + 100, y + 8);
  doc.text(`₹${fmtINR(Math.round(baseAmt))}`, margin + 120, y + 8);
  doc.text('18%', margin + 138, y + 8);
  doc.text(`₹${fmtINR(Math.round(rawAmt))}`, pageW - margin - 4, y + 8, { align: 'right' });
  y += 14;

  // Totals box
  y += 6;
  doc.setDrawColor(220, 210, 200);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  const totals: [string, string, boolean][] = [
    ['Subtotal (before GST)', `₹${fmtINR(Math.round(baseAmt))}`, false],
    ['CGST @ 9%',             `₹${fmtINR(Math.round(gstAmt / 2))}`, false],
    ['SGST @ 9%',             `₹${fmtINR(Math.round(gstAmt / 2))}`, false],
    ['Total Amount',          inv.amt, true],
  ];

  totals.forEach(([label, value, bold]) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 11 : 9);
    doc.setTextColor(bold ? 42 : 80, bold ? 33 : 70, bold ? 25 : 60);
    doc.text(label, pageW - margin - 80, y);
    doc.setTextColor(bold ? 34 : 40, bold ? 139 : 35, bold ? 34 : 30);
    doc.text(value, pageW - margin - 4, y, { align: 'right' });
    y += bold ? 10 : 8;
  });

  y += 8;
  doc.setDrawColor(220, 210, 200);
  doc.line(margin, y, pageW - margin, y);
  y += 12;

  // Bank details
  doc.setFillColor(248, 244, 239);
  doc.roundedRect(margin, y, 80, 32, 3, 3, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80, 70, 60);
  doc.text('BANK DETAILS', margin + 4, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(42, 33, 25);
  doc.text('HDFC Bank · A/C: 50100234567890', margin + 4, y + 16);
  doc.text('IFSC: HDFC0001234 · SWIFT: HDFCINBB', margin + 4, y + 22);
  doc.text('Branch: Koramangala, Bengaluru', margin + 4, y + 28);

  // Terms
  doc.setFillColor(248, 244, 239);
  doc.roundedRect(pageW - margin - 80, y, 80, 32, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80, 70, 60);
  doc.text('TERMS', pageW - margin - 76, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(42, 33, 25);
  doc.text('Payment due: 15 days', pageW - margin - 76, y + 16);
  doc.text('Late fee: 2% per month', pageW - margin - 76, y + 22);
  doc.text('INR payments only', pageW - margin - 76, y + 28);

  // Footer
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(42, 33, 25);
  doc.rect(0, pageH - 16, pageW, 16, 'F');
  doc.setTextColor(120, 110, 95);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('This is a computer-generated invoice. MG Nova Pvt. Ltd. · support@mgnova.in · www.mgnova.in', margin, pageH - 6);

  doc.setFillColor(34, 139, 34);
  doc.rect(0, pageH - 18, pageW, 2, 'F');

  doc.save(`Invoice_MGNOVA_${inv.id}.pdf`);
}

async function downloadTransferReceipt(
  fromAmt: number, toUpi: string, note: string, txnId: string, ts: string
) {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 0;

  doc.setFillColor(42, 33, 25);
  doc.rect(0, 0, pageW, 44, 'F');
  doc.setTextColor(247, 243, 238);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('MG Nova', margin, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 170, 155);
  doc.text('Freelancer Platform · Transfer Receipt', margin, 27);
  doc.setFontSize(9);
  doc.setTextColor(120, 110, 95);
  doc.text(`Generated: ${ts}`, margin, 38);

  y = 60;

  doc.setFillColor(42, 80, 150);
  doc.roundedRect(margin, y - 6, 32, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('TRANSFER', margin + 3, y + 1);

  y += 14;
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(42, 80, 150);
  doc.text(`-₹${fmtINR(fromAmt)}`, margin, y + 10);
  y += 22;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 90, 80);
  doc.text(`Transferred to ${toUpi}`, margin, y);
  y += 12;

  doc.setDrawColor(220, 210, 200);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageW - margin, y);
  y += 12;

  const rows: [string, string][] = [
    ['Reference ID',   txnId],
    ['Date & Time',    ts],
    ['To (UPI ID)',    toUpi],
    ['Note',           note || 'N/A'],
    ['Mode',           'UPI Transfer'],
    ['Status',         'SUCCESS'],
  ];

  doc.setFontSize(10);
  rows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 70, 60);
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 35, 30);
    doc.text(value, margin + 55, y);
    y += 10;
  });

  doc.setFillColor(42, 80, 150);
  doc.rect(0, doc.internal.pageSize.getHeight() - 4, pageW, 4, 'F');

  doc.save(`Transfer_${txnId}.pdf`);
}

// ─── PayMethodSelector ────────────────────────────────────────────────────────
function PayMethodSelector({ selected, onSelect }: { selected: string; onSelect: (k: string) => void }) {
  const methods = [
    { key: 'upi',        emoji: '🏦', label: 'UPI',                  sub: 'Instant · Google Pay, PhonePe, Paytm' },
    { key: 'card',       emoji: '💳', label: 'Credit / Debit Card',   sub: 'Visa, Mastercard, RuPay' },
    { key: 'netbanking', emoji: '🏛', label: 'Net Banking',           sub: 'All major Indian banks' },
    { key: 'wallet',     emoji: '👛', label: 'MG Nova Credits',       sub: 'Use platform wallet balance' },
  ];
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {methods.map(m => (
        <div key={m.key} onClick={() => onSelect(m.key)}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${selected === m.key ? C.green : `${C.rodeo}50`}`, background: selected === m.key ? C.greenLight : '#fff', cursor: 'pointer', transition: 'all .18s' }}>
          <div style={{ width: 40, height: 40, borderRadius: 9, background: selected === m.key ? '#fff' : C.ivory, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{m.emoji}</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.coffee, margin: '0 0 2px', fontFamily: "'DM Sans', sans-serif" }}>{m.label}</p>
            <p style={{ ...s.label, margin: 0 }}>{m.sub}</p>
          </div>
          <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selected === m.key ? C.green : `${C.rodeo}60`}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {selected === m.key && <div style={{ width: 9, height: 9, borderRadius: '50%', background: C.green }} />}
          </div>
        </div>
      ))}
    </div>
  );
}

function UPIPanel({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const examples = ['demo@okaxis', 'business@ybl', 'pay@paytm', 'user@okicici'];
  return (
    <div style={{ marginTop: 16 }}>
      <label style={{ ...s.label, display: 'block', marginBottom: 6 }}>Enter UPI ID</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder="yourname@okaxis"
        style={{ ...s.input, marginBottom: 8, fontFamily: 'monospace', fontSize: 14 }} />
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {examples.map(ex => (
          <button key={ex} onClick={() => onChange(ex)}
            style={{ ...s.btn, fontSize: 10, padding: '4px 10px', background: C.ivory, color: C.gray, border: `1px solid ${C.rodeo}40` }}>
            {ex}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 11, color: C.gray, margin: '8px 0 0', fontFamily: "'DM Sans', sans-serif" }}>
        ℹ Demo environment — no real UPI transaction will occur
      </p>
    </div>
  );
}

function CardPanel() {
  const [num, setNum] = React.useState('');
  const formatCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  return (
    <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
      <div>
        <label style={{ ...s.label, display: 'block', marginBottom: 5 }}>Card Number</label>
        <input value={num} onChange={e => setNum(formatCard(e.target.value))} placeholder="4111 1111 1111 1111" style={s.input} maxLength={19} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><label style={{ ...s.label, display: 'block', marginBottom: 5 }}>Expiry</label><input placeholder="MM / YY" style={s.input} maxLength={7} /></div>
        <div><label style={{ ...s.label, display: 'block', marginBottom: 5 }}>CVV</label><input type="password" placeholder="•••" style={s.input} maxLength={3} /></div>
      </div>
      <div><label style={{ ...s.label, display: 'block', marginBottom: 5 }}>Name on Card</label><input placeholder="RAHUL SHARMA" style={{ ...s.input, textTransform: 'uppercase' }} /></div>
    </div>
  );
}

function NetBankingPanel() {
  const [sel, setSel] = React.useState('');
  const banks = ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra Bank', 'Yes Bank', 'IndusInd Bank'];
  const colors: Record<string, string> = { 'HDFC Bank': '#004C97', 'ICICI Bank': '#F36F21', 'State Bank of India': '#22409A', 'Axis Bank': '#800000', 'Kotak Mahindra Bank': '#ED1C24', 'Yes Bank': '#00457C', 'IndusInd Bank': '#EC1C2A' };
  const shorts: Record<string, string> = { 'HDFC Bank': 'HD', 'ICICI Bank': 'IC', 'State Bank of India': 'SB', 'Axis Bank': 'AX', 'Kotak Mahindra Bank': 'KO', 'Yes Bank': 'YB', 'IndusInd Bank': 'IN' };
  return (
    <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
      {banks.map(b => (
        <div key={b} onClick={() => setSel(b)}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${sel === b ? C.green : `${C.rodeo}40`}`, background: sel === b ? C.greenLight : '#fff', cursor: 'pointer', transition: 'all .18s' }}>
          <div style={{ width: 32, height: 32, borderRadius: 7, background: colors[b], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>{shorts[b]}</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.coffee, fontFamily: "'DM Sans', sans-serif" }}>{b}</span>
          {sel === b && <CheckCircle size={15} color={C.green} style={{ marginLeft: 'auto' }} />}
        </div>
      ))}
    </div>
  );
}

function PaymentProcessing({ label, subLabel }: { label: string; subLabel: string }) {
  const [prog, setProgress] = React.useState(5);
  React.useEffect(() => {
    const iv = setInterval(() => setProgress(p => Math.min(p + Math.random() * 18 + 6, 98)), 280);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: .8, repeat: Infinity, ease: 'linear' }}
        style={{ width: 64, height: 64, borderRadius: '50%', background: C.goldLight, margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RefreshCw size={26} color={C.gold} />
      </motion.div>
      <p style={{ fontSize: 16, fontWeight: 700, color: C.coffee, margin: '0 0 6px', fontFamily: "'DM Sans', sans-serif" }}>{label}</p>
      <p style={{ fontSize: 12, color: C.gray, margin: '0 0 24px', fontFamily: "'DM Sans', sans-serif" }}>{subLabel}</p>
      <div style={{ height: 4, background: `${C.rodeo}25`, borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
        <motion.div style={{ height: '100%', background: C.green, borderRadius: 99 }} animate={{ width: `${prog}%` }} transition={{ duration: .3 }} />
      </div>
      <p style={{ fontSize: 12, color: C.gray, fontFamily: "'DM Sans', sans-serif" }}>{Math.round(prog)}%</p>
      <p style={{ fontSize: 10, color: C.gray, margin: '16px 0 0', fontFamily: "'DM Sans', sans-serif" }}>🔒 256-bit SSL Encrypted · Demo Payment Environment</p>
    </div>
  );
}

// ─── ReleaseMilestoneModal ────────────────────────────────────────────────────
export function ReleaseMilestoneModal({ open, onClose, milestone, onSuccess }: {
  open: boolean; onClose: () => void;
  milestone: MilestonePayment | null;
  onSuccess: (txn: IndianTransaction) => void;
}) {
  const [step, setStep] = React.useState<'select' | 'processing' | 'success'>('select');
  const [payMethod, setPayMethod] = React.useState('upi');
  const [upiId, setUpiId] = React.useState('');
  const [txnId, setTxnId] = React.useState('');
  const [ts, setTs] = React.useState('');

  React.useEffect(() => { if (open) { setStep('select'); setPayMethod('upi'); setUpiId(''); } }, [open]);

  const proceed = () => {
    setStep('processing');
    const id = genTxnId();
    const timestamp = nowTs();
    setTxnId(id);
    setTs(timestamp);
    setTimeout(() => {
      setStep('success');
      if (milestone) {
        onSuccess({
          id, desc: `Milestone Release — ${milestone.proj}`, amt: `+${milestone.amt}`,
          rawAmt: milestone.rawAmt, date: timestamp, type: 'credit', status: 'success',
          via: payMethod === 'upi' ? `UPI • ${upiId || 'demo@okaxis'}` : payMethod.toUpperCase(),
        });
      }
    }, 3000);
  };

  if (!milestone) return null;

  return (
    <Modal open={open} onClose={step === 'processing' ? () => {} : onClose} title="Release Milestone Payment" width={520}>
      {step === 'select' && (
        <>
          <div style={{ background: C.ivory, borderRadius: 10, padding: '12px 16px', marginBottom: 18 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.coffee, margin: '0 0 6px', fontFamily: "'DM Sans', sans-serif" }}>{milestone.proj}</p>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div><p style={s.label}>Amount</p><p style={{ fontSize: 22, fontWeight: 800, color: C.green, margin: '2px 0 0', fontFamily: "'DM Sans', sans-serif" }}>{milestone.amt}</p></div>
              <div><p style={s.label}>Client</p><p style={{ fontSize: 13, fontWeight: 600, color: C.coffee, margin: '2px 0 0', fontFamily: "'DM Sans', sans-serif" }}>{milestone.client}</p></div>
              <div><p style={s.label}>Milestone</p><p style={{ fontSize: 12, color: C.gray, margin: '2px 0 0', fontFamily: "'DM Sans', sans-serif" }}>{milestone.ms}</p></div>
            </div>
          </div>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.coffee, letterSpacing: '.06em', marginBottom: 10, fontFamily: "'DM Sans', sans-serif" }}>SELECT PAYMENT METHOD</p>
          <PayMethodSelector selected={payMethod} onSelect={setPayMethod} />
          {payMethod === 'upi' && <UPIPanel value={upiId} onChange={setUpiId} />}
          {payMethod === 'card' && <CardPanel />}
          {payMethod === 'netbanking' && <NetBankingPanel />}
          {payMethod === 'wallet' && (
            <div style={{ marginTop: 16, background: C.greenLight, border: `1px solid ${C.greenMid}`, borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
              <p style={s.label}>MG Nova Wallet Credits</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: C.green, margin: '4px 0', fontFamily: "'DM Sans', sans-serif" }}>₹1,24,350</p>
              <p style={{ fontSize: 11, color: C.gray, fontFamily: "'DM Sans', sans-serif" }}>Available balance</p>
            </div>
          )}
          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ ...s.btn, ...s.btnSecondary }}>Cancel</button>
            <button onClick={proceed} style={{ ...s.btn, ...s.btnPrimary, flex: 1, justifyContent: 'center', fontSize: 14, padding: '12px' }}>
              <Zap size={14} /> Proceed to Pay {milestone.amt}
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: 10, color: C.gray, margin: '10px 0 0', fontFamily: "'DM Sans', sans-serif" }}>
            🔒 256-bit encrypted · Demo Payment Environment
          </p>
        </>
      )}
      {step === 'processing' && (
        <PaymentProcessing label="Processing Payment…" subLabel="Contacting payment gateway · Please wait" />
      )}
      {step === 'success' && (
        <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '20px 0 8px' }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20, delay: .1 }}
            style={{ width: 72, height: 72, borderRadius: '50%', background: C.greenLight, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={32} color={C.green} />
          </motion.div>
          <p style={{ fontSize: 28, fontWeight: 800, color: C.green, margin: '0 0 6px', fontFamily: "'DM Sans', sans-serif" }}>{milestone.amt}</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: C.coffee, margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif" }}>Successfully Released!</p>
          <p style={{ fontSize: 12, color: C.gray, margin: '0 0 24px', fontFamily: "'DM Sans', sans-serif" }}>{milestone.proj} · {milestone.client}</p>
          <div style={{ background: C.greenLight, borderRadius: 12, padding: '14px 16px', textAlign: 'left', marginBottom: 20, border: `1px solid ${C.greenMid}` }}>
            {[['Transaction ID', txnId], ['Time', ts], ['Method', payMethod === 'upi' ? `UPI • ${upiId || 'demo@okaxis'}` : payMethod.toUpperCase()], ['Status', 'SUCCESS ✓']].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${C.greenMid}` }}>
                <span style={s.label}>{l}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.coffee, fontFamily: 'monospace' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button style={{ ...s.btn, ...s.btnSecondary, fontSize: 12 }}
              onClick={() => downloadTransactionReceipt({
                id: txnId, desc: `Milestone Release — ${milestone.proj}`,
                amt: `+${milestone.amt}`, rawAmt: milestone.rawAmt, date: ts,
                type: 'credit', status: 'success',
                via: payMethod === 'upi' ? `UPI • ${upiId || 'demo@okaxis'}` : payMethod.toUpperCase(),
              })}>
              <Download size={13} /> Receipt PDF
            </button>
            <button onClick={onClose} style={{ ...s.btn, ...s.btnPrimary }}><Check size={13} /> Done</button>
          </div>
          <p style={{ fontSize: 10, color: C.gray, margin: '12px 0 0', fontFamily: "'DM Sans', sans-serif" }}>Funds credited to your MG Nova wallet instantly</p>
        </motion.div>
      )}
    </Modal>
  );
}

// ─── WithdrawModal ────────────────────────────────────────────────────────────
export function WithdrawModal({ open, onClose, balance, onSuccess }: {
  open: boolean; onClose: () => void; balance: number;
  onSuccess: (amt: number, bank: typeof BANKS[0], txnId: string) => void;
}) {
  const [step, setStep] = React.useState<'select' | 'processing' | 'success'>('select');
  const [amount, setAmount] = React.useState('');
  const [selBank, setSelBank] = React.useState(0);
  const [txnId, setTxnId] = React.useState('');
  const [ts, setTs] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => { if (open) { setStep('select'); setAmount(''); setSelBank(0); setError(''); } }, [open]);

  const proceed = () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 100) { setError('Minimum withdrawal is ₹100'); return; }
    if (amt > balance) { setError('Insufficient wallet balance'); return; }
    setError('');
    setStep('processing');
    const id = genTxnId();
    const timestamp = nowTs();
    setTxnId(id);
    setTs(timestamp);
    setTimeout(() => { setStep('success'); onSuccess(amt, BANKS[selBank], id); }, 3200);
  };

  const quickAmounts = [10000, 25000, 50000, 100000];

  return (
    <Modal open={open} onClose={step === 'processing' ? () => {} : onClose} title="Withdraw Funds" width={480}>
      {step === 'select' && (
        <>
          <div style={{ background: C.greenLight, border: `1px solid ${C.greenMid}`, borderRadius: 10, padding: '14px 16px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><p style={s.label}>Available Balance</p><p style={{ fontSize: 24, fontWeight: 800, color: C.green, margin: '4px 0 0', fontFamily: "'DM Sans', sans-serif" }}>₹{fmtINR(balance)}</p></div>
            <Wallet size={28} color={C.green} />
          </div>
          <label style={{ ...s.label, display: 'block', marginBottom: 6 }}>Withdrawal Amount</label>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, fontWeight: 700, color: C.green, fontFamily: "'DM Sans', sans-serif" }}>₹</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount"
              style={{ ...s.input, paddingLeft: 28, fontSize: 16, fontWeight: 600 }} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {quickAmounts.map(v => (
              <button key={v} onClick={() => setAmount(String(v))}
                style={{ ...s.btn, fontSize: 11, padding: '5px 12px', background: String(v) === amount ? C.greenLight : C.ivory, color: String(v) === amount ? C.green : C.gray, border: `1px solid ${String(v) === amount ? C.green : `${C.rodeo}40`}` }}>
                ₹{fmtINR(v)}
              </button>
            ))}
          </div>
          <label style={{ ...s.label, display: 'block', marginBottom: 10 }}>Select Bank Account</label>
          <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
            {BANKS.map((b, i) => (
              <div key={b.name} onClick={() => setSelBank(i)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${selBank === i ? C.green : `${C.rodeo}40`}`, background: selBank === i ? C.greenLight : '#fff', cursor: 'pointer', transition: 'all .18s' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: b.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>{b.short}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.coffee, margin: '0 0 2px', fontFamily: "'DM Sans', sans-serif" }}>{b.name}</p>
                  <p style={{ ...s.label, margin: 0 }}>Savings {b.acno} · IFSC {b.ifsc}</p>
                </div>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selBank === i ? C.green : `${C.rodeo}50`}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {selBank === i && <div style={{ width: 9, height: 9, borderRadius: '50%', background: C.green }} />}
                </div>
              </div>
            ))}
          </div>
          {error && (
            <div style={{ background: C.redLight, border: `1px solid ${C.red}30`, borderRadius: 8, padding: '10px 14px', marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
              <AlertCircle size={14} color={C.red} />
              <p style={{ fontSize: 12, color: C.red, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{error}</p>
            </div>
          )}
          <button onClick={proceed} style={{ ...s.btn, ...s.btnPrimary, width: '100%', justifyContent: 'center', fontSize: 14, padding: '12px' }}>
            <ArrowUpRight size={15} /> Withdraw{amount ? ` ₹${fmtINR(parseFloat(amount) || 0)}` : ' Funds'}
          </button>
          <p style={{ textAlign: 'center', fontSize: 10, color: C.gray, margin: '10px 0 0', fontFamily: "'DM Sans', sans-serif" }}>
            Funds typically settle in 1–2 business days · Demo Environment
          </p>
        </>
      )}
      {step === 'processing' && (
        <PaymentProcessing label="Initiating Transfer…" subLabel={`Connecting to ${BANKS[selBank].name} · IMPS`} />
      )}
      {step === 'success' && (
        <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '20px 0 8px' }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20, delay: .1 }}
            style={{ width: 72, height: 72, borderRadius: '50%', background: C.greenLight, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={32} color={C.green} />
          </motion.div>
          <p style={{ fontSize: 28, fontWeight: 800, color: C.green, margin: '0 0 6px', fontFamily: "'DM Sans', sans-serif" }}>₹{fmtINR(parseFloat(amount))}</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: C.coffee, margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif" }}>Transfer Initiated!</p>
          <p style={{ fontSize: 12, color: C.gray, margin: '0 0 24px', fontFamily: "'DM Sans', sans-serif" }}>{BANKS[selBank].name} {BANKS[selBank].acno}</p>
          <div style={{ background: C.greenLight, borderRadius: 12, padding: '14px 16px', textAlign: 'left', marginBottom: 20, border: `1px solid ${C.greenMid}` }}>
            {[['Reference ID', txnId], ['Bank', BANKS[selBank].name], ['Account', BANKS[selBank].acno], ['IFSC', BANKS[selBank].ifsc], ['Time', ts]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${C.greenMid}` }}>
                <span style={s.label}>{l}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.coffee, fontFamily: 'monospace' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button style={{ ...s.btn, ...s.btnSecondary, fontSize: 12 }}
              onClick={() => downloadWithdrawalReceipt(parseFloat(amount), BANKS[selBank], txnId, ts)}>
              <Download size={13} /> Receipt PDF
            </button>
            <button onClick={onClose} style={{ ...s.btn, ...s.btnPrimary }}><Check size={13} /> Done</button>
          </div>
          <p style={{ fontSize: 10, color: C.gray, margin: '12px 0 0', fontFamily: "'DM Sans', sans-serif" }}>
            Typically reflects in your bank within 30 minutes
          </p>
        </motion.div>
      )}
    </Modal>
  );
}

// ─── TransferModal ────────────────────────────────────────────────────────────
export function TransferModal({ open, onClose, balance, onSuccess }: {
  open: boolean; onClose: () => void; balance: number;
  onSuccess: (amt: number, toUpi: string, note: string, txnId: string) => void;
}) {
  const [step, setStep] = React.useState<'form' | 'processing' | 'success'>('form');
  const [amount, setAmount] = React.useState('');
  const [toUpi, setToUpi] = React.useState('');
  const [note, setNote] = React.useState('');
  const [txnId, setTxnId] = React.useState('');
  const [ts, setTs] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (open) { setStep('form'); setAmount(''); setToUpi(''); setNote(''); setError(''); }
  }, [open]);

  const proceed = () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 1) { setError('Enter a valid amount'); return; }
    if (!toUpi.trim()) { setError('Enter recipient UPI ID'); return; }
    if (amt > balance) { setError('Insufficient balance'); return; }
    setError('');
    setStep('processing');
    const id = genTxnId();
    const timestamp = nowTs();
    setTxnId(id); setTs(timestamp);
    setTimeout(() => { setStep('success'); onSuccess(amt, toUpi, note, id); }, 2800);
  };

  return (
    <Modal open={open} onClose={step === 'processing' ? () => {} : onClose} title="Transfer Funds" width={460}>
      {step === 'form' && (
        <>
          <div style={{ background: C.greenLight, border: `1px solid ${C.greenMid}`, borderRadius: 10, padding: '12px 16px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><p style={s.label}>Wallet Balance</p><p style={{ fontSize: 20, fontWeight: 800, color: C.green, margin: '4px 0 0', fontFamily: "'DM Sans', sans-serif" }}>₹{fmtINR(balance)}</p></div>
            <Send size={24} color={C.green} />
          </div>
          <label style={{ ...s.label, display: 'block', marginBottom: 5 }}>Recipient UPI ID *</label>
          <input value={toUpi} onChange={e => setToUpi(e.target.value)} placeholder="name@okaxis"
            style={{ ...s.input, marginBottom: 14, fontFamily: 'monospace' }} />
          <label style={{ ...s.label, display: 'block', marginBottom: 5 }}>Amount (₹) *</label>
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15, fontWeight: 700, color: C.green }}>₹</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"
              style={{ ...s.input, paddingLeft: 28, fontSize: 15, fontWeight: 600 }} />
          </div>
          <label style={{ ...s.label, display: 'block', marginBottom: 5 }}>Note (optional)</label>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Project payment, reimbursement..."
            style={{ ...s.input, marginBottom: 18 }} />
          {error && (
            <div style={{ background: C.redLight, border: `1px solid ${C.red}30`, borderRadius: 8, padding: '10px 14px', marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
              <AlertCircle size={14} color={C.red} />
              <p style={{ fontSize: 12, color: C.red, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{error}</p>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ ...s.btn, ...s.btnSecondary }}>Cancel</button>
            <button onClick={proceed} style={{ ...s.btn, ...s.btnPrimary, flex: 1, justifyContent: 'center' }}>
              <Send size={14} /> Transfer via UPI
            </button>
          </div>
        </>
      )}
      {step === 'processing' && <PaymentProcessing label="Sending Transfer…" subLabel={`UPI transfer to ${toUpi}`} />}
      {step === 'success' && (
        <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '20px 0 8px' }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20, delay: .1 }}
            style={{ width: 72, height: 72, borderRadius: '50%', background: C.greenLight, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={32} color={C.green} />
          </motion.div>
          <p style={{ fontSize: 26, fontWeight: 800, color: C.coffee, margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif" }}>₹{fmtINR(parseFloat(amount))}</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: C.coffee, margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif" }}>Transfer Successful!</p>
          <p style={{ fontSize: 12, color: C.gray, margin: '0 0 20px', fontFamily: "'DM Sans', sans-serif" }}>To: {toUpi}</p>
          <div style={{ background: C.greenLight, borderRadius: 12, padding: '14px 16px', textAlign: 'left', marginBottom: 20, border: `1px solid ${C.greenMid}` }}>
            {[['Reference ID', txnId], ['To', toUpi], ['Note', note || 'N/A'], ['Time', ts], ['Mode', 'UPI']].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.greenMid}` }}>
                <span style={s.label}>{l}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.coffee, fontFamily: 'monospace' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button style={{ ...s.btn, ...s.btnSecondary, fontSize: 12 }}
              onClick={() => downloadTransferReceipt(parseFloat(amount), toUpi, note, txnId, ts)}>
              <Download size={13} /> Receipt PDF
            </button>
            <button onClick={onClose} style={{ ...s.btn, ...s.btnPrimary }}><Check size={13} /> Done</button>
          </div>
        </motion.div>
      )}
    </Modal>
  );
}

// ─── WalletPage ───────────────────────────────────────────────────────────────
export function WalletPage({ isMobile }: { isMobile: boolean }) {
  const [balance, setBalance] = useState(124350);
  const [transactions, setTransactions] = useState<IndianTransaction[]>(INDIAN_TRANSACTIONS);
  const [milestones, setMilestones] = useState<MilestonePayment[]>(INDIAN_MILESTONES);
  const [activeTab, setActiveTab] = useState<'txn' | 'milestones' | 'invoices'>('txn');
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [selectedMS, setSelectedMS] = useState<MilestonePayment | null>(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const totalWithdrawn = transactions.filter(t => t.type === 'debit' && t.status === 'success').reduce((a, t) => a + Math.abs(t.rawAmt), 0);
  const totalEarned = transactions.filter(t => t.type === 'credit' && t.status === 'success').reduce((a, t) => a + t.rawAmt, 0);
  const totalPending = transactions.filter(t => t.status === 'pending').reduce((a, t) => a + t.rawAmt, 0);

  const handleMilestoneRelease = (txn: IndianTransaction) => {
    setBalance(b => b + txn.rawAmt);
    setTransactions(prev => [txn, ...prev]);
    setMilestones(prev => prev.map(m => m.id === selectedMS?.id ? { ...m, status: 'released' as const } : m));
    setReleaseOpen(false);
  };

  const handleWithdrawSuccess = (amt: number, bank: typeof BANKS[0], txnId: string) => {
    const timestamp = nowTs();
    setBalance(b => b - amt);
    setTransactions(prev => [{
      id: txnId, desc: `Withdrawal to ${bank.name} ${bank.acno}`, amt: `-₹${fmtINR(amt)}`,
      rawAmt: -amt, date: timestamp, type: 'debit' as const, status: 'success' as const, via: 'IMPS',
    }, ...prev]);
    // keep modal open so user can download receipt — modal closes on Done
  };

  const handleTransferSuccess = (amt: number, toUpi: string, note: string, txnId: string) => {
    const timestamp = nowTs();
    setBalance(b => b - amt);
    setTransactions(prev => [{
      id: txnId, desc: `UPI Transfer → ${toUpi}${note ? ` · ${note}` : ''}`, amt: `-₹${fmtINR(amt)}`,
      rawAmt: -amt, date: timestamp, type: 'debit' as const, status: 'success' as const, via: 'UPI',
    }, ...prev]);
  };

  const statusCfg = {
    released: { label: 'Released',  color: C.green,  bg: C.greenLight  },
    pending:  { label: 'Pending',   color: '#b8860b', bg: C.goldLight   },
    escrow:   { label: 'In Escrow', color: C.copper,  bg: C.copperLight },
  };

  const tabs: { key: 'txn' | 'milestones' | 'invoices'; label: string }[] = [
    { key: 'txn',        label: 'Transaction History' },
    { key: 'milestones', label: 'Milestone Payments'  },
    { key: 'invoices',   label: 'Invoices'             },
  ];

  return (
    <motion.div key="wallet" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .25 }}>

      <ReleaseMilestoneModal open={releaseOpen} onClose={() => setReleaseOpen(false)} milestone={selectedMS} onSuccess={handleMilestoneRelease} />
      <WithdrawModal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} balance={balance} onSuccess={handleWithdrawSuccess} />
      <TransferModal open={transferOpen} onClose={() => setTransferOpen(false)} balance={balance} onSuccess={handleTransferSuccess} />

      {/* Hero Balance Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: C.coffee, borderRadius: 16, padding: isMobile ? '22px 20px' : '28px 32px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: `${C.green}18` }} />
        <div style={{ position: 'absolute', bottom: -30, right: 60, width: 100, height: 100, borderRadius: '50%', background: `${C.gold}12` }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,.1)', borderRadius: 5, padding: '3px 10px', marginBottom: 12 }}>
            <Shield size={10} color={`${C.ivory}70`} />
            <span style={{ fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: `${C.ivory}60`, fontFamily: "'DM Sans', sans-serif" }}>Demo Payment Environment</span>
          </div>
          <p style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: `${C.ivory}55`, marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>Available Balance</p>
          <p style={{ fontSize: isMobile ? 34 : 44, fontWeight: 800, color: C.ivory, margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-.02em' }}>
            ₹<span>{fmtINR(balance)}</span><span style={{ fontSize: 20, fontWeight: 400, opacity: .5 }}>.00</span>
          </p>
          <div style={{ display: 'flex', gap: isMobile ? 16 : 32, flexWrap: 'wrap', margin: '12px 0 22px' }}>
            {[['Pending Clearance', '₹18,500'], ['Escrow Balance', '₹45,000'], ['Total Withdrawn', `₹${fmtINR(totalWithdrawn)}`]].map(([l, v]) => (
              <div key={l}>
                <p style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: `${C.ivory}50`, marginBottom: 3, fontFamily: "'DM Sans', sans-serif" }}>{l}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: `${C.ivory}75`, fontFamily: "'DM Sans', sans-serif" }}>{v}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => setWithdrawOpen(true)} style={{ ...s.btn, background: C.green, color: C.ivory }}><ArrowUpRight size={14} /> Withdraw Funds</button>
            <button onClick={() => setTransferOpen(true)} style={{ ...s.btn, background: 'rgba(247,243,238,.12)', color: C.ivory, border: `1px solid rgba(247,243,238,.2)` }}>
              <Send size={14} /> Transfer
            </button>
            <button onClick={() => setActiveTab('invoices')} style={{ ...s.btn, background: 'rgba(247,243,238,.1)', color: C.ivory, border: `1px solid rgba(247,243,238,.15)` }}>
              <Download size={14} /> Invoices
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Earned',  value: `₹${fmtINR(totalEarned + balance)}`, sub: '↑ +18% this month', color: C.green   },
          { label: 'Pending',       value: `₹${fmtINR(totalPending)}`,           sub: '3 milestones',     color: '#b8860b' },
          { label: 'Withdrawn',     value: `₹${fmtINR(totalWithdrawn)}`,          sub: 'Lifetime total',   color: C.copper  },
          { label: 'Escrow',        value: '₹45,000',                             sub: '2 active contracts', color: C.coffee },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .07 }} style={s.card}>
            <p style={{ ...s.label, marginBottom: 4 }}>{stat.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: stat.color, margin: '0 0 3px', fontFamily: "'DM Sans', sans-serif" }}>{stat.value}</p>
            <p style={{ fontSize: 11, color: stat.color, fontFamily: "'DM Sans', sans-serif", opacity: .8 }}>{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#fff', border: `1px solid ${C.rodeo}30`, borderRadius: 10, padding: 4, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ flex: 1, padding: '8px 6px', borderRadius: 7, border: 'none', background: activeTab === t.key ? C.green : 'transparent', color: activeTab === t.key ? '#fff' : C.gray, fontSize: isMobile ? 10 : 12, fontWeight: 600, cursor: 'pointer', transition: 'all .18s', fontFamily: "'DM Sans', sans-serif" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Transaction History */}
      {activeTab === 'txn' && (
        <div style={{ ...s.card, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.rodeo}25`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.coffee, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>All Transactions</p>
              <p style={{ ...s.label, margin: '2px 0 0' }}>{transactions.length} transactions</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={{ ...s.btn, ...s.btnSecondary, padding: '6px 12px', fontSize: 11 }}><Filter size={12} /> Filter</button>
              <button style={{ ...s.btn, ...s.btnSecondary, padding: '6px 12px', fontSize: 11 }}><Download size={12} /> Export CSV</button>
            </div>
          </div>
          {transactions.map((tx, i) => (
            <motion.div key={tx.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .05 + i * .04 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: i < transactions.length - 1 ? `1px solid ${C.rodeo}15` : 'none', cursor: 'pointer', transition: 'background .15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.ivory}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: tx.type === 'credit' ? C.greenLight : C.copperLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {tx.type === 'credit' ? <ArrowUpRight size={16} color={C.green} /> : <ArrowDownRight size={16} color={C.copper} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.coffee, margin: '0 0 2px', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.desc}</p>
                  <p style={{ ...s.label, margin: 0 }}><span style={{ fontFamily: 'monospace' }}>{tx.id}</span> · {tx.via}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: tx.type === 'credit' ? C.green : C.copper, margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif" }}>{tx.amt}</p>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end' }}>
                  <Badge color={tx.status === 'success' ? C.green : C.gold}>{tx.status === 'success' ? '✓ Success' : '⏳ Pending'}</Badge>
                  {tx.status === 'success' && (
                    <button
                      onClick={e => { e.stopPropagation(); downloadTransactionReceipt(tx); }}
                      style={{ ...s.btn, padding: '2px 8px', fontSize: 10, background: C.ivory, color: C.gray, border: `1px solid ${C.rodeo}40` }}
                      title="Download Receipt PDF">
                      <Download size={10} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Milestone Payments */}
      {activeTab === 'milestones' && (
        <div style={{ display: 'grid', gap: 14 }}>
          {milestones.map((m, i) => {
            const cfg = statusCfg[m.status];
            return (
              <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .07 }} style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.coffee, margin: '0 0 3px', fontFamily: "'DM Sans', sans-serif" }}>{m.proj}</p>
                    <p style={{ ...s.label, margin: 0 }}>{m.ms} · {m.client}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 22, fontWeight: 800, color: C.green, margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif" }}>{m.amt}</p>
                    <span style={{ ...s.tag(cfg.color), background: cfg.bg }}>{cfg.label}</span>
                  </div>
                </div>
                <Divider />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
                  <p style={{ ...s.label, margin: 0 }}>ID: {m.id} · Due {m.dueDate}</p>
                  {m.status === 'escrow' && (
                    <button onClick={() => { setSelectedMS(m); setReleaseOpen(true); }}
                      style={{ ...s.btn, ...s.btnPrimary, fontSize: 12, padding: '7px 16px' }}>
                      <Zap size={12} /> Release Payment
                    </button>
                  )}
                  {m.status === 'pending' && (
                    <button style={{ ...s.btn, ...s.btnSecondary, fontSize: 12, padding: '7px 14px' }}>
                      <Clock size={12} /> Request Release
                    </button>
                  )}
                  {m.status === 'released' && (
                    <button style={{ ...s.btn, fontSize: 12, padding: '7px 14px', background: C.greenLight, color: C.green, border: 'none' }}>
                      <CheckCircle size={12} /> Released
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Invoices */}
      {activeTab === 'invoices' && (
        <div style={{ ...s.card, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.rodeo}25`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.coffee, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Tax Invoices</p>
              <p style={{ ...s.label, margin: '2px 0 0' }}>Auto-generated · GST compliant</p>
            </div>
            <button style={{ ...s.btn, ...s.btnPrimary, fontSize: 12 }}><Plus size={12} /> New Invoice</button>
          </div>
          {INDIAN_INVOICES.map((inv, i) => (
            <div key={inv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: i < INDIAN_INVOICES.length - 1 ? `1px solid ${C.rodeo}15` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: C.goldLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📄</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.coffee, margin: '0 0 2px', fontFamily: "'DM Sans', sans-serif" }}>{inv.proj}</p>
                  <p style={{ ...s.label, margin: 0 }}>{inv.id} · {inv.client} · GSTIN {inv.gstin}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.green, margin: '0 0 6px', fontFamily: "'DM Sans', sans-serif" }}>{inv.amt}</p>
                <button
                  style={{ ...s.btn, background: C.greenLight, color: C.green, border: 'none', padding: '4px 12px', fontSize: 11 }}
                  onClick={() => downloadInvoicePDF(inv)}>
                  <Download size={11} /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}