import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, Settings, BadgeAlert, CheckCircle, RefreshCw, 
  User as UserIcon, ListMusic, CreditCard, ChevronRight, XCircle,
  Sparkles, Bot, FileText, Check, AlertTriangle, Eye, ShieldCheck,
  UserCheck, AlertCircle, MessageSquare, ExternalLink, Paperclip, Zap
} from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { API_URL } from '../config';
import { 
  fetchAllReleasesAdmin, fetchAllTicketsAdmin, fetchAllPaymentsAdmin,
  updateReleaseStatusAdmin, verifyPaymentAdmin, retryTicketEmailAdmin,
  detectFakeUtr
} from '../services/dataService';

const AdminPanel = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [releases, setReleases] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('payments'); // 'payments', 'releases', 'tickets'
  
  // Release Review Modal
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [reviewAction, setReviewAction] = useState('');
  const [reviewReason, setReviewReason] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Payment Verification Action Modal
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentAction, setPaymentAction] = useState(''); // 'verified' | 'rejected'
  const [paymentReason, setPaymentReason] = useState('');
  const [submittingPaymentAction, setSubmittingPaymentAction] = useState(false);
  const [retryingTicketId, setRetryingTicketId] = useState(null);

  const handleRetryEmail = async (ticket) => {
    const tId = ticket.ticketId || ticket.id;
    setRetryingTicketId(tId);
    try {
      const res = await retryTicketEmailAdmin(tId);
      if (res.success || res.emailDelivery?.adminSent) {
        setSuccess(`Notification email re-dispatched for ticket ${tId}`);
        const allTickets = await fetchAllTicketsAdmin();
        setTickets(allTickets);
      } else {
        setError(res.error || 'Failed to retry notification email.');
      }
    } catch (err) {
      setError(err.message || 'Error retrying email.');
    } finally {
      setRetryingTicketId(null);
    }
  };

  const loadAdminData = async () => {
    const storedUserStr = localStorage.getItem('user');
    const authUser = auth?.currentUser;

    if (!storedUserStr && !authUser) {
      navigate('/login');
      return;
    }

    let parsedUser = null;
    if (storedUserStr) {
      try { parsedUser = JSON.parse(storedUserStr); } catch (e) {}
    }
    if (!parsedUser && authUser) {
      parsedUser = {
        uid: authUser.uid,
        email: authUser.email,
        artistName: authUser.displayName || 'Owner Console',
        role: authUser.email === 'adventureof693@gmail.com' ? 'Admin' : 'Artist'
      };
    }

    setCurrentUser(parsedUser);

    if (parsedUser.role !== 'Admin' && parsedUser.email !== 'adventureof693@gmail.com') {
      setError('Access Denied. Owner credentials required.');
      setLoading(false);
      return;
    }

    // 1. Fetch real gateway payments from Firestore & Gateway API
    const allPayments = await fetchAllPaymentsAdmin();
    setPayments(allPayments);

    // 2. Fetch real releases from Firestore
    const allReleases = await fetchAllReleasesAdmin();
    setReleases(allReleases);

    // 3. Fetch real support tickets from Firestore
    const allTickets = await fetchAllTicketsAdmin();
    setTickets(allTickets);

    setLoading(false);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Handle Admin Review Action (Approve, Reject, Changes Required)
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRelease || !reviewAction) return;

    if ((reviewAction === 'rejected' || reviewAction === 'changes_required') && !reviewReason.trim()) {
      setError('Please provide a reason or changes required notes for the artist.');
      return;
    }

    setSubmittingReview(true);
    setError('');
    setSuccess('');

    const res = await updateReleaseStatusAdmin(
      selectedRelease.id || selectedRelease._id, 
      reviewAction, 
      reviewReason.trim()
    );

    setSubmittingReview(false);

    if (res.success) {
      setSuccess(`Release "${selectedRelease.releaseTitle}" updated to status: ${reviewAction.replace('_', ' ')}!`);
      setSelectedRelease(null);
      setReviewReason('');
      loadAdminData();
    } else {
      setError(res.error || 'Failed to update release review status.');
    }
  };

  // Handle Admin Payment Verification Action
  const handlePaymentActionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPayment || !paymentAction) return;

    if (paymentAction === 'verified') {
      const fakeCheck = detectFakeUtr(selectedPayment.utr);
      if (fakeCheck.isFake) {
        setError(`⚠️ Cannot verify payment: UTR ${selectedPayment.utr} is fake (${fakeCheck.reason}). Please select "Reject" instead.`);
        return;
      }
    }

    setSubmittingPaymentAction(true);
    setError('');
    setSuccess('');

    const res = await verifyPaymentAdmin(
      selectedPayment.id,
      paymentAction,
      paymentReason.trim()
    );

    setSubmittingPaymentAction(false);

    if (res.success) {
      setSuccess(`Payment UTR ${selectedPayment.utr} marked as ${paymentAction.toUpperCase()}! ${
        paymentAction === 'verified' 
          ? (selectedPayment.paymentType === 'release' ? 'Release upload unlocked!' : 'Subscription activated!')
          : 'User notified of rejection.'
      }`);
      setSelectedPayment(null);
      setPaymentReason('');
      loadAdminData();
    } else {
      setError(res.error || 'Failed to update payment status.');
    }
  };

  if (loading) {
    return (
      <div className="pt-32 flex flex-col items-center justify-center min-h-[500px] text-zinc-100 font-outfit">
        <div className="w-8 h-8 rounded-full border-2 border-t-red-500 border-zinc-800 animate-spin mb-4" />
        <span className="font-heading font-semibold text-zinc-500 text-xs tracking-widest uppercase">Booting Owner Console...</span>
      </div>
    );
  }

  // Restrict access to Admin
  if (currentUser?.role !== 'Admin' && currentUser?.email !== 'adventureof693@gmail.com') {
    return (
      <div className="pt-32 max-w-md mx-auto px-4 text-center space-y-6 text-zinc-100 font-outfit">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-white">Access Violation</h2>
        <p className="text-zinc-400 text-xs leading-relaxed">
          Access Denied. This terminal is strictly restricted to platform owner (<span className="text-white font-semibold">adventureof693@gmail.com</span>).
        </p>
      </div>
    );
  }

  return (
    <div className="relative pt-20 pb-16 min-h-screen bg-[#070709] text-zinc-100 font-outfit">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10 space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="font-heading font-extrabold text-3xl text-white flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-red-500" />
              Owner Portal
            </h1>
            <p className="text-zinc-400 text-xs uppercase tracking-widest font-semibold pt-1">
              Official Merchant UPI Verification & Ingestion Management
            </p>
          </div>
          <button 
            onClick={loadAdminData}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300 hover:text-white flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload Real Data
          </button>
        </div>

        {success && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab selection links */}
        <div className="flex flex-wrap gap-4 border-b border-white/10 pb-4">
          {[
            { id: 'payments', label: `Payment Gateway Audit (${payments.length})`, icon: <CreditCard className="w-4 h-4" /> },
            { id: 'releases', label: `Release Review Queue (${releases.length})`, icon: <ListMusic className="w-4 h-4" /> },
            { id: 'tickets', label: `Support Tickets (${tickets.length})`, icon: <FileText className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all ${
                activeTab === tab.id 
                  ? 'bg-red-500/10 border border-red-500/30 text-red-400 font-bold' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: AUTOMATED GATEWAY PAYMENT AUDIT RECORDS */}
        {activeTab === 'payments' && (
          <div className="minimal-card p-6 sm:p-8 bg-[#09090d] border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" /> Automated Payment Gateway Records
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Verified server-side via Razorpay / UPI Gateway webhooks. No manual approval required.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 font-mono">Total Transactions: {payments.length}</span>
              </div>
            </div>

            {payments.length === 0 ? (
              <div className="p-10 text-center space-y-2 border border-dashed border-white/10 rounded-2xl bg-white/2">
                <p className="text-zinc-500 text-xs">No payment gateway records found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((pay, idx) => {
                  const isSuccess = pay.status === 'SUCCESS' || pay.status === 'verified';
                  const isPending = pay.status === 'PENDING' || pay.status === 'CREATED' || pay.status === 'pending_verification';
                  const isFailed = pay.status === 'FAILED' || pay.status === 'rejected' || pay.status === 'CANCELLED';

                  return (
                    <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:border-white/20 transition-all">
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          {isSuccess && (
                            <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5 shadow-[0_0_15px_rgba(52,211,153,0.15)]">
                              <Check className="w-3 h-3" /> SUCCESS (AUTO-VERIFIED)
                            </span>
                          )}
                          {isPending && (
                            <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/40 flex items-center gap-1.5 animate-pulse">
                              <Clock className="w-3 h-3" /> PENDING GATEWAY CONFIRMATION
                            </span>
                          )}
                          {isFailed && (
                            <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/40 flex items-center gap-1.5">
                              <AlertCircle className="w-3 h-3" /> FAILED / REJECTED
                            </span>
                          )}

                          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                            {pay.paymentType === 'release' ? '🎵 Release Distribution' : '⭐ Subscription Plan'}
                          </span>
                        </div>

                        {/* Order & Customer Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase font-bold block">Customer</span>
                            <span className="text-white font-semibold">{pay.customerName || 'Artist'}</span>
                            <span className="text-zinc-400 text-[11px] block">{pay.userEmail}</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase font-bold block">Order ID</span>
                            <span className="font-mono text-sky-400 font-bold select-all">{pay.orderId || pay.id}</span>
                            <span className="text-zinc-500 text-[10px] block">Gateway: {pay.paymentGateway || 'RAZORPAY'}</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase font-bold block">Gateway Tx ID</span>
                            <span className="font-mono text-[#DEDCFF] font-semibold select-all">
                              {pay.gatewayPaymentId || pay.transactionId || pay.utr || 'Pending Gateway Sync'}
                            </span>
                            <span className="text-zinc-500 text-[10px] block">Method: {pay.paymentMethod || pay.upiApp || 'UPI'}</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase font-bold block">Amount &amp; Timestamp</span>
                            <span className="text-emerald-400 font-black text-sm">₹{pay.amount}</span>
                            <span className="text-zinc-500 text-[10px] block">
                              {new Date(pay.verifiedAt || pay.createdAt || Date.now()).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {pay.releaseTitle && (
                          <div className="text-[11px] text-zinc-400">
                            Release: <strong className="text-white">{pay.releaseTitle}</strong>
                          </div>
                        )}
                      </div>

                      {/* Status Indicator */}
                      <div className="flex items-center gap-3 shrink-0">
                        {isSuccess ? (
                          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>Release Unlocked ✓</span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500 font-mono">
                            Auto-processing via webhook
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REAL RELEASE REVIEW QUEUE */}
        {activeTab === 'releases' && (
          <div className="minimal-card p-8 bg-[#09090d] border-white/10 space-y-6">
            <h3 className="font-heading font-bold text-lg text-white">Ingestion Review Pipeline</h3>
            {releases.length === 0 ? (
              <div className="p-10 text-center space-y-2 border border-dashed border-white/10 rounded-2xl bg-white/2">
                <p className="text-zinc-500 text-xs">No catalog releases in submission queue.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {releases.map((rel, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <img 
                        src={rel.artworkUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop'}
                        alt={rel.releaseTitle}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop';
                        }}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/10 shadow-md"
                      />
                      <div className="space-y-1">
                        <h4 className="font-heading font-bold text-base text-white">{rel.releaseTitle}</h4>
                        <p className="text-zinc-400 text-xs">{rel.primaryArtist} • {rel.genre} • {rel.releaseType}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          Payment: <span className={rel.paymentStatus === 'paid' ? 'text-emerald-400 font-bold' : 'text-[#DEDCFF]'}>{rel.paymentStatus || 'unpaid'}</span> • UPC: {rel.upc || 'Not assigned'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 border-t border-white/10 pt-3 md:border-none md:pt-0">
                      <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${
                        rel.status === 'approved' || rel.status === 'distributed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        rel.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                        rel.status === 'changes_required' ? 'bg-[#585589]/20 text-[#DEDCFF] border border-[#585589]/40' :
                        'bg-white/10 text-zinc-300 border border-white/20'
                      }`}>
                        {rel.status?.replace('_', ' ')}
                      </span>

                      <button
                        onClick={() => { setSelectedRelease(rel); setReviewAction('approved'); }}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase border border-emerald-500/30"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => { setSelectedRelease(rel); setReviewAction('changes_required'); }}
                        className="px-3.5 py-1.5 rounded-lg bg-[#585589]/20 hover:bg-[#585589]/30 text-[#DEDCFF] text-[11px] font-bold uppercase border border-[#585589]/40"
                      >
                        Request Changes
                      </button>

                      <button
                        onClick={() => { setSelectedRelease(rel); setReviewAction('rejected'); }}
                        className="px-3.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-bold uppercase border border-red-500/30"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SUPPORT TICKETS QUEUE */}
        {activeTab === 'tickets' && (
          <div className="minimal-card p-8 bg-[#09090d] border-white/10 space-y-6">
            <h3 className="font-heading font-bold text-lg text-white">Support Tickets Queue</h3>
            {tickets.length === 0 ? (
              <div className="p-10 text-center space-y-2 border border-dashed border-white/10 rounded-2xl bg-white/2">
                <p className="text-zinc-500 text-xs">No open support tickets.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((tic, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-amber-400 font-bold text-xs bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded">
                            {tic.ticketId || tic.id}
                          </span>
                          {tic.releaseId && (
                            <span className="font-mono text-zinc-400 text-[11px] bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                              Release: {tic.releaseId}
                            </span>
                          )}
                        </div>
                        <h4 className="font-heading font-bold text-sm text-white">{tic.subject}</h4>
                        <p className="text-zinc-400 text-xs">From: {tic.name} ({tic.email})</p>
                      </div>
                      <div className="text-right space-y-1">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          tic.status === 'Open' ? 'bg-[#585589]/20 text-[#DEDCFF] border border-[#585589]/40' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {tic.status}
                        </span>
                        {tic.emailDelivery && (
                          <div className="text-[10px] text-zinc-500 flex items-center justify-end gap-1">
                            <span className={tic.emailDelivery.adminSent ? 'text-emerald-400' : 'text-amber-400'}>
                              {tic.emailDelivery.adminSent ? '● Email Sent' : '○ Email Local'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      {tic.message}
                    </div>

                    {/* Attachments Section */}
                    {tic.attachments && tic.attachments.length > 0 && (
                      <div className="p-3 rounded-xl bg-white/3 border border-white/10 space-y-1.5">
                        <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Attached Documents ({tic.attachments.length}):</span>
                        <div className="flex flex-wrap gap-2">
                          {tic.attachments.map((att, aIdx) => {
                            const downloadHref = att.url || `${API_URL}/api/tickets/attachments/${tic.ticketId || tic.id}/${att.fileId}?token=${att.downloadToken}`;
                            return (
                              <a
                                key={aIdx}
                                href={downloadHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-medium transition-all"
                              >
                                <Paperclip className="w-3.5 h-3.5" />
                                <span>{att.name || att.originalName || `Document ${aIdx + 1}`}</span>
                                <ExternalLink className="w-3 h-3 text-sky-400/70" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap justify-between items-center text-[10px] text-zinc-500 pt-1 gap-2">
                      <span>Category: {tic.category} • Submitted: {tic.createdAt?.split('T')[0]}</span>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => handleRetryEmail(tic)}
                          disabled={retryingTicketId === (tic.ticketId || tic.id)}
                          className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer disabled:opacity-50"
                        >
                          {retryingTicketId === (tic.ticketId || tic.id) ? 'Retrying Email...' : 'Retry Email Notice'}
                        </button>
                        <a href={`mailto:${tic.email}?subject=RE: [${tic.ticketId || tic.id}] ${encodeURIComponent(tic.subject)}`} className="text-sky-400 font-semibold hover:underline">
                          Reply via Email →
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Payment Action Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 font-outfit">
          <div className="w-full max-w-md minimal-card rounded-3xl p-8 bg-[#0d0d12] border-white/15 space-y-6">
            <div>
              <h3 className="font-heading font-bold text-xl text-white">
                {paymentAction === 'verified' ? 'Verify UPI Payment' : 'Reject UPI Payment'}
              </h3>
              <p className="text-zinc-400 text-xs mt-1">
                UTR: <strong className="text-[#DEDCFF] font-mono">{selectedPayment.utr}</strong> (₹{selectedPayment.amount})
              </p>
              <p className="text-zinc-500 text-[11px]">User: {selectedPayment.userEmail}</p>
            </div>

            <form onSubmit={handlePaymentActionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Action Confirmation</label>
                <select
                  value={paymentAction}
                  onChange={(e) => setPaymentAction(e.target.value)}
                  className="w-full bg-[#0d0d12] border border-white/10 rounded-xl px-4 py-3 text-xs text-white"
                >
                  <option value="verified">Verify Payment & Unlock Features</option>
                  <option value="rejected">Reject Payment Submission</option>
                </select>
              </div>

              {paymentAction === 'rejected' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Rejection Reason *</label>
                  <textarea
                    rows={3}
                    required
                    value={paymentReason}
                    onChange={(e) => setPaymentReason(e.target.value)}
                    placeholder="e.g. UTR number not found in bank statement..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                  />
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPayment(null)}
                  className="btn-secondary w-1/2 py-3 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPaymentAction}
                  className="btn-primary w-1/2 py-3 rounded-xl text-xs font-semibold"
                >
                  {submittingPaymentAction ? 'Updating...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Release Review Modal */}
      {selectedRelease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 font-outfit">
          <div className="w-full max-w-md minimal-card rounded-3xl p-8 bg-[#0d0d12] border-white/15 space-y-6">
            <div>
              <h3 className="font-heading font-bold text-xl text-white">Review Release</h3>
              <p className="text-zinc-400 text-xs mt-1">{selectedRelease.releaseTitle} by {selectedRelease.primaryArtist}</p>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Action</label>
                <select
                  value={reviewAction}
                  onChange={(e) => setReviewAction(e.target.value)}
                  className="w-full bg-[#0d0d12] border border-white/10 rounded-xl px-4 py-3 text-xs text-white"
                >
                  <option value="approved">Approve Release</option>
                  <option value="changes_required">Request Changes</option>
                  <option value="rejected">Reject Release</option>
                </select>
              </div>

              {(reviewAction === 'rejected' || reviewAction === 'changes_required') && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    {reviewAction === 'rejected' ? 'Rejection Reason *' : 'Changes Required Notes *'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={reviewReason}
                    onChange={(e) => setReviewReason(e.target.value)}
                    placeholder="Describe exact guidance for the artist..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40 resize-none"
                  />
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRelease(null)}
                  className="btn-secondary w-1/2 py-3 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-primary w-1/2 py-3 rounded-xl text-xs font-semibold"
                >
                  {submittingReview ? 'Saving...' : 'Confirm Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
