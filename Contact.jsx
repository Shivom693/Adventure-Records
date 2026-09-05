import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { submitSupportTicket } from '../services/dataService';
import { auth } from '../firebase';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [status, setStatus] = useState({ submitted: false, error: null });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;

    setLoading(true);
    setStatus({ submitted: false, error: null });

    const authUser = auth?.currentUser;

    const result = await submitSupportTicket({
      userId: authUser?.uid || null,
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject,
      category: 'General Contact',
      message: formData.message.trim()
    });

    setLoading(false);

    if (result.success) {
      setStatus({ submitted: true, error: null });
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
    } else {
      setStatus({ submitted: false, error: result.error || 'Unable to send your message. Please try again.' });
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
          Need help registering your Official Artist Channel, checking catalog releases, or transferring catalogs? Get in touch with our operations desk.
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
                Our operations team operates 9 AM to 6 PM (IST), Monday through Saturday. We review support tickets within 12 hours.
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
                    <p className="text-zinc-500 text-xs mt-0.5">General & Legal Inquiries</p>
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
                    <p className="text-zinc-500 text-xs mt-0.5">Branch Office</p>
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
              <h3 className="font-heading font-bold text-xl text-white mb-6">Open Support Ticket</h3>

              {status.error && (
                <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{status.error}</span>
                </div>
              )}

              {status.submitted ? (
                <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="font-heading font-bold text-lg text-white">Message Sent Successfully!</h4>
                  <p className="text-zinc-400 text-xs max-w-md mx-auto leading-relaxed">
                    Your support ticket has been logged and dispatched to <span className="text-white font-semibold">adventureof693@gmail.com</span>. Our team will get back to you shortly.
                  </p>
                  <button
                    onClick={() => setStatus({ submitted: false, error: null })}
                    className="btn-secondary px-6 py-2.5 rounded-xl text-xs font-semibold mt-2"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Name & Email Group */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-xs font-semibold text-zinc-300">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Shiv Om"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
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

                  {/* Subject Dropdown */}
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-xs font-semibold text-zinc-300">
                      Inquiry Subject
                    </label>
                    <select
                      id="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full bg-[#0d0d12] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/40 transition-all"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Billing & Pricing">Billing & Pricing</option>
                      <option value="Track Ingestion Issues">Track Ingestion Issues</option>
                      <option value="ISRC / UPC Codes">ISRC / UPC Codes</option>
                      <option value="Official Channels Sync">Official Channels Sync</option>
                    </select>
                  </div>

                  {/* Message box */}
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-xs font-semibold text-zinc-300">
                      Detail Description *
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Detail your request..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {loading ? 'Sending...' : 'Submit Support Ticket'}
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
