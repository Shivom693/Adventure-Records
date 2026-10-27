import React, { useState, useRef } from 'react';
import { 
  Phone, Mail, MapPin, Send, HelpCircle, CheckCircle2, AlertCircle, 
  Paperclip, UploadCloud, X, FileText, Image as ImageIcon, Loader2 
} from 'lucide-react';
import { submitSupportTicket } from '../services/dataService';
import { auth } from '../firebase';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'General Inquiry',
    subject: 'General Inquiry',
    message: '',
    releaseId: '',
    hp_field: '' // Hidden honeypot
  });

  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const [status, setStatus] = useState({ submitted: false, error: null, ticketId: null });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
  const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.pdf'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const MAX_FILES = 3;

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === 'subject') {
      setFormData(prev => ({ ...prev, subject: value, category: value }));
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleFileChange = (e) => {
    setFileError('');
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    if (files.length + selectedFiles.length > MAX_FILES) {
      setFileError(`You can attach a maximum of ${MAX_FILES} files. You already have ${files.length} attached.`);
      return;
    }

    const validatedFiles = [];
    for (const file of selectedFiles) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!ALLOWED_EXTS.includes(ext) || !ALLOWED_TYPES.includes(file.type)) {
        setFileError(`File "${file.name}" is not permitted. Only JPG, PNG, and PDF files are accepted.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFileError(`File "${file.name}" exceeds the 5 MB size limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
        return;
      }
      validatedFiles.push(file);
    }

    setFiles(prev => [...prev, ...validatedFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (indexToRemove) => {
    setFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
    setFileError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;

    // Check bot honeypot
    if (formData.hp_field) {
      setStatus({ submitted: true, error: null, ticketId: 'AR-TICK-SECURE' });
      return;
    }

    setLoading(true);
    setStatus({ submitted: false, error: null, ticketId: null });

    const authUser = auth?.currentUser;

    const result = await submitSupportTicket({
      userId: authUser?.uid || null,
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject,
      category: formData.category || 'General Support',
      message: formData.message.trim(),
      releaseId: formData.releaseId?.trim() || null,
      attachments: files
    });

    setLoading(false);

    if (result.success) {
      setStatus({
        submitted: true,
        error: null,
        ticketId: result.ticketId || result.ticket?.ticketId || 'AR-TICK-' + Date.now().toString(36).toUpperCase()
      });
      setFormData({
        name: '',
        email: '',
        category: 'General Inquiry',
        subject: 'General Inquiry',
        message: '',
        releaseId: '',
        hp_field: ''
      });
      setFiles([]);
    } else {
      setStatus({
        submitted: false,
        error: result.error || 'Unable to submit your support ticket. Please check your connection and retry.',
        ticketId: null
      });
    }
  };

  return (
    <div className="relative pt-20 overflow-x-hidden min-h-screen bg-[#070709] text-zinc-100 font-outfit">
      
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center space-y-4">
        <div className="minimal-badge mx-auto">Helpdesk & Support</div>
        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-white tracking-tight">
          Contact Our <br />
          <span className="text-zinc-400">Distribution Team</span>
        </h1>
        <p className="text-zinc-400 text-sm max-w-2xl mx-auto leading-relaxed">
          Need help registering your Official Artist Channel, checking catalog releases, resolving payment questions, or submitting takedowns? Get in touch with our operations desk.
        </p>
      </section>

      {/* Grid Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto">
          
          {/* Contact details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="minimal-card rounded-3xl p-8 border-white/10 space-y-6 bg-[#09090d]">
              <h3 className="font-heading font-bold text-xl text-white">Support Channels</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Our operations team operates 9 AM to 6 PM (IST), Monday through Saturday. All support tickets receive automated email tracking and are answered within 12 hours.
              </p>

              <div className="space-y-6 pt-4">
                {/* Phone Call */}
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-white/5 border border-white/10 text-white rounded-xl shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-white text-sm">Direct Phone Hotline</h5>
                    <p className="text-zinc-500 text-xs mt-0.5">Call or WhatsApp Support</p>
                    <a 
                      href="tel:+919691546208" 
                      className="text-lg font-bold text-white hover:underline mt-1 block"
                    >
                      +91 9691546208
                    </a>
                  </div>
                </div>

                {/* Email Support */}
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-white/5 border border-white/10 text-white rounded-xl shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-white text-sm">Email Helpdesk</h5>
                    <p className="text-zinc-500 text-xs mt-0.5">Official Ingestion & Billing Desk</p>
                    <a 
                      href="mailto:adventureof693@gmail.com" 
                      className="text-zinc-300 hover:text-white font-semibold mt-1 block"
                    >
                      adventureof693@gmail.com
                    </a>
                  </div>
                </div>

                {/* Physical Location */}
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-white/5 border border-white/10 text-white rounded-xl shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-white text-sm">Operations Office</h5>
                    <p className="text-zinc-500 text-xs mt-0.5">Distribution Headquarters</p>
                    <p className="text-zinc-300 text-xs mt-1 leading-relaxed">
                      Adventure Records, Rode Bus Stand Complex, Satna, MP, 485005, India
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-7">
            <div className="minimal-card rounded-3xl p-8 sm:p-10 border-white/10 bg-[#09090d] relative">
              <h3 className="font-heading font-bold text-xl text-white mb-2">Open Support Ticket</h3>
              <p className="text-zinc-400 text-xs mb-6">Submit your inquiry with optional documents or payment receipts for fast resolution.</p>

              {status.error && (
                <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{status.error}</span>
                </div>
              )}

              {status.submitted ? (
                <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4 animate-fade-in">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
                  <h4 className="font-heading font-bold text-xl text-white">Ticket Logged Successfully!</h4>
                  
                  <div className="inline-block px-4 py-2 bg-black/60 border border-emerald-500/40 rounded-xl my-2">
                    <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Your Ticket ID</span>
                    <span className="font-mono text-base font-bold text-amber-400">{status.ticketId}</span>
                  </div>

                  <p className="text-zinc-300 text-xs max-w-md mx-auto leading-relaxed">
                    A confirmation email has been dispatched to your inbox. Our curation team will review your inquiry within <strong className="text-white">12 hours</strong>.
                  </p>

                  <button
                    onClick={() => setStatus({ submitted: false, error: null, ticketId: null })}
                    className="btn-secondary px-6 py-2.5 rounded-xl text-xs font-semibold mt-4"
                  >
                    Open Another Support Ticket
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Anti-bot Honeypot field (hidden from real users) */}
                  <input
                    type="text"
                    id="hp_field"
                    value={formData.hp_field}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                    tabIndex="-1"
                    autoComplete="off"
                  />

                  {/* Name & Email Group */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-xs font-semibold text-zinc-300">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Alex Vance"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-xs font-semibold text-zinc-300">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="artist@domain.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-all"
                      />
                    </div>
                  </div>

                  {/* Subject & Optional Release ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label htmlFor="subject" className="text-xs font-semibold text-zinc-300">
                        Inquiry Subject / Category *
                      </label>
                      <select
                        id="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full bg-[#0d0d12] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40 transition-all"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Billing & Pricing">Billing & Pricing / UPI Verification</option>
                        <option value="Track Ingestion Issues">Track Ingestion Issues</option>
                        <option value="ISRC / UPC Codes">ISRC / UPC Barcodes</option>
                        <option value="Official Channels Sync">Official Artist Channel Sync</option>
                        <option value="Copyright & Takedown">Copyright & Takedown Request</option>
                        <option value="Artist Verification">Artist ID Verification</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="releaseId" className="text-xs font-semibold text-zinc-300">
                        Associated Release ID (Optional)
                      </label>
                      <input
                        type="text"
                        id="releaseId"
                        value={formData.releaseId}
                        onChange={handleChange}
                        placeholder="e.g. rel_1740000000"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-all"
                      />
                    </div>
                  </div>

                  {/* Message box */}
                  <div className="space-y-1.5">
                    <label htmlFor="message" className="text-xs font-semibold text-zinc-300">
                      Detail Description *
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please provide full details about your request, issue, or question..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-all resize-none"
                    />
                  </div>

                  {/* Support File Uploads Section (Task 2) */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-amber-400" />
                        Attach Documents or Screenshots (Optional)
                      </label>
                      <span className="text-[10px] text-zinc-500">Max 3 files • Up to 5 MB each</span>
                    </div>

                    {fileError && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fileError}</span>
                      </div>
                    )}

                    {/* Upload Drop Area */}
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-dashed border-white/15 hover:border-amber-400/50 rounded-2xl p-4 sm:p-5 text-center cursor-pointer bg-white/2 hover:bg-white/4 transition-all"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <UploadCloud className="w-6 h-6 text-zinc-400 mx-auto mb-1.5" />
                      <p className="text-xs text-zinc-300 font-medium">
                        Click to browse or drop support files
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Permitted types: <span className="text-zinc-400 font-mono">JPG, PNG, PDF</span>
                      </p>
                    </div>

                    {/* Selected Files List */}
                    {files.length > 0 && (
                      <div className="space-y-2 pt-2">
                        {files.map((file, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-xs"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              {file.type === 'application/pdf' ? (
                                <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-sky-400 shrink-0" />
                              )}
                              <span className="text-white truncate font-medium max-w-[220px] sm:max-w-xs">{file.name}</span>
                              <span className="text-zinc-500 text-[10px] shrink-0">
                                ({(file.size / 1024).toFixed(0)} KB)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(idx)}
                              className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-all ml-2"
                              title="Remove file"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Ticket & Dispatching Emails...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Support Ticket</span>
                      </>
                    )}
                  </button>

                </form>
              )}

            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Contact;
