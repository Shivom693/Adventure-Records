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

  const [autoVerifyingAll, setAutoVerifyingAll] = useState(false);

  const handleAutoVerifyAllPending = async () => {
    const pendingList = payments.filter(p => p.status === 'pending_verification');
    if (pendingList.length === 0) return;
    setAutoVerifyingAll(true);
    setError('');
    setSuccess('');
    let verifiedCount = 0;
    let rejectedCount = 0;
    for (const pay of pendingList) {
      const fakeCheck = detectFakeUtr(pay.utr);
      if (fakeCheck.isFake) {
        await verifyPaymentAdmin(pay.id, 'rejected', `Fake UTR detected: ${fakeCheck.reason}`);
        rejectedCount++;
      } else {
        const res = await verifyPaymentAdmin(pay.id, 'verified', 'Auto-verified via instant admin batch check.');
        if (res.success) verifiedCount++;
      }
    }
    setAutoVerifyingAll(false);
    setSuccess(`Batch complete: ${verifiedCount} payment(s) verified, ${rejectedCount} fake UTR(s) rejected!`);
    await loadAdminData();
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

    // 1. Fetch real payments from Firestore
    const allPayments = await fetchAllPaymentsAdmin();
    // Scan and auto-reject any fake UTRs in Firestore
    for (const pay of allPayments) {
      if (pay.utr) {
        const fakeCheck = detectFakeUtr(pay.utr);
        if (fakeCheck.isFake && pay.status !== 'rejected') {
          pay.status = 'rejected';
          pay.rejectedReason = `Fake UTR detected: ${fakeCheck.reason}`;
          if (db && pay.id) {
            try {
              await updateDoc(doc(db, 'payments', pay.id), {
                status: 'rejected',
                rejectedReason: `Fake UTR detected: ${fakeCheck.reason}`,
                verifiedAt: null,
                verifiedBy: null,
                updatedAt: new Date().toISOString()
              });
              if (pay.paymentType === 'release' && pay.targetId) {
                await updateDoc(doc(db, 'releases', pay.targetId), {
                  paymentStatus: 'rejected',
                  uploadUnlocked: false,
                  updatedAt: new Date().toISOString()
                });
              }
            } catch (e) {}
          }
        }
      }
    }
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
            { id: 'payments', label: `UPI Payments Queue (${payments.filter(p => p.status === 'pending_verification').length})`, icon: <CreditCard className="w-4 h-4" /> },
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

        {/* TAB 1: REAL UPI PAYMENTS VERIFICATION QUEUE */}
        {activeTab === 'payments' && (
          <div className="minimal-card p-8 bg-[#09090d] border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" /> UPI Payment Verification Queue (Merchant: 9691546208-3@ybl)
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 font-mono">Total Submissions: {payments.length}</span>
                {payments.some(p => p.status === 'pending_verification') && (
                  <button
                    onClick={handleAutoVerifyAllPending}
                    disabled={autoVerifyingAll}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-500/30 transition-all shadow-sm disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {autoVerifyingAll ? 'Auto-Verifying...' : '⚡ Auto-Verify All Pending'}
                  </button>
                )}
              </div>
            </div>

            {payments.length === 0 ? (
              <div className="p-10 text-center space-y-2 border border-dashed border-white/10 rounded-2xl bg-white/2">
                <p className="text-zinc-500 text-xs">No payment verification submissions found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((pay, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        {detectFakeUtr(pay.utr).isFake ? (
                          <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> FAKE UTR (REJECTED)
                          </span>
                        ) : (
                          <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${
                            pay.status === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                            pay.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                            'bg-[#585589]/20 text-[#DEDCFF] border border-[#585589]/40 animate-pulse'
                          }`}>
                            {pay.status === 'pending_verification' ? 'PENDING VERIFICATION' : pay.status?.toUpperCase()}
                          </span>
                        )}
                        <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                          {pay.paymentType === 'release' ? '🎵 Release Payment' : '⭐ Subscription Payment'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-heading font-bold text-base text-white">
                          {pay.releaseTitle || pay.planName || 'Music Distribution'} — <span className="text-emerald-400">₹{pay.amount}</span>
                        </h4>
                        <p className="text-xs text-zinc-300">
                          User: <strong className="text-white">{pay.userEmail}</strong>
                        </p>
                        <p className="text-xs font-mono text-[#DEDCFF] font-bold">
                          UTR / Trans ID: {pay.utr} • App: {pay.upiApp}
                        </p>
                        {detectFakeUtr(pay.utr).isFake && (
                          <p className="text-xs text-red-400 font-semibold flex items-center gap-1.5 pt-0.5">
                            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            Fraud Alert: {detectFakeUtr(pay.utr).reason}
                          </p>
                        )}
                        <p className="text-[10px] text-zinc-500">
                          Submitted: {new Date(pay.createdAt || Date.now()).toLocaleString()} • Receiver: {pay.merchantUpiId || '9691546208-3@ybl'}
                        </p>
                      </div>

                      {pay.screenshotUrl && (
                        <a 
                          href={pay.screenshotUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-sky-400 font-semibold hover:underline pt-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View Payment Screenshot Proof
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-3 border-t border-white/10 pt-3 lg:border-none lg:pt-0">
                      {pay.status === 'pending_verification' ? (
                        <>
                          <button
                            onClick={() => { setSelectedPayment(pay); setPaymentAction('verified'); }}
                            className="px-4 py-2.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs uppercase shadow-lg hover:bg-emerald-400 transition-all flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" /> Verify Payment
                          </button>
                          <button
                            onClick={() => { setSelectedPayment(pay); setPaymentAction('rejected'); }}
                            className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs uppercase transition-all"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-zinc-500 font-mono">
                          Action completed ({pay.status})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
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
