import React from 'react';
import { CreditCard, Mail, Globe } from 'lucide-react';

const RefundPolicy = () => {
  return (
    <div className="relative pt-12 pb-24 min-h-screen bg-[#070709] text-zinc-300 font-outfit">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="space-y-4 border-b border-white/10 pb-8 text-center sm:text-left">
          <div className="minimal-badge">Billing Terms</div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight">
            REFUND POLICY
          </h1>
          <p className="text-zinc-400 text-sm">
            Last Updated: September 3, 2026 • Adventure Records Subscription Services
          </p>
        </div>

        {/* Policy Body */}
        <div className="space-y-8 text-sm leading-relaxed font-normal">
          
          <p className="text-base text-zinc-200">
            This Refund Policy explains the circumstances under which payments made for Adventure Records services may be refunded.
          </p>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">1. GENERAL POLICY</h2>
            <p>Adventure Records provides digital music distribution and related services.</p>
            <p>Because certain services may begin processing immediately after payment, refunds may not be available once a service or release has entered processing.</p>
            <p>Refund eligibility depends on:</p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>The service purchased</li>
              <li>Whether processing has started</li>
              <li>Whether distribution has been initiated</li>
              <li>The reason for the refund request</li>
              <li>Applicable payment laws and regulations</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">2. BEFORE SERVICE PROCESSING</h2>
            <p>If a user requests a cancellation before the purchased service has started processing, Adventure Records may consider a refund.</p>
            <p>Refunds are subject to verification and applicable terms.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">3. AFTER RELEASE PROCESSING</h2>
            <p>Once a release has entered processing, review, delivery, or distribution, the payment may become non-refundable.</p>
            <p>This may include situations where:</p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Metadata review has started</li>
              <li>Audio processing has started</li>
              <li>Artwork processing has started</li>
              <li>Distribution delivery has started</li>
              <li>The release has been submitted to digital platforms</li>
              <li>The release has already been delivered to one or more platforms</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">4. RELEASE REJECTION</h2>
            <p>A release being rejected does not automatically mean that the user is entitled to a refund.</p>
            <p>If a release is rejected because of:</p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400 grid grid-cols-1 sm:grid-cols-2 gap-1">
              <li>Copyright issues</li>
              <li>Incorrect metadata</li>
              <li>Invalid artwork</li>
              <li>Poor audio quality</li>
              <li>Missing information</li>
              <li>Incorrect identifiers</li>
              <li>Platform policy violations</li>
              <li>User-provided errors</li>
              <li>Rights or ownership problems</li>
            </ul>
            <p>the payment may remain non-refundable if the service has already been performed or processing has begun.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">5. DUPLICATE PAYMENTS</h2>
            <p>If you were charged more than once for the same service due to a technical or payment error, contact Adventure Records.</p>
            <p>After verification, duplicate charges may be refunded.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">6. TECHNICAL PAYMENT ERRORS</h2>
            <p>If a payment was completed but the purchased service was not properly activated because of a technical problem, contact support.</p>
            <p>Adventure Records may investigate the transaction and determine an appropriate resolution.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">7. REFUND REQUEST</h2>
            <p>To request a refund, contact:</p>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mt-3 space-y-1">
              <p className="font-semibold text-white">Email: <a href="mailto:adventureof693@gmail.com" className="text-white underline">adventureof693@gmail.com</a></p>
              <p className="text-xs text-zinc-400 mt-2">Include:</p>
              <ul className="list-disc pl-5 text-xs text-zinc-400 space-y-1">
                <li>Full name</li>
                <li>Account email</li>
                <li>Transaction ID</li>
                <li>Date of payment</li>
                <li>Service purchased</li>
                <li>Reason for the refund request</li>
              </ul>
              <p className="text-[11px] text-zinc-500 mt-1">Providing complete information helps us process the request faster.</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">8. REFUND PROCESSING</h2>
            <p>If a refund is approved, it will generally be processed through the original payment method where possible.</p>
            <p>The time required for the refund to appear in your account may depend on the payment provider, bank, card issuer, or other financial institution.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">9. NON-REFUNDABLE SERVICES</h2>
            <p>Unless otherwise required by applicable law, services that have already been fully performed or substantially processed may not be eligible for a refund.</p>
            <p>This may include completed distribution, completed release processing, or other services already delivered.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">10. CHARGEBACKS</h2>
            <p>Users should contact Adventure Records before initiating a payment dispute or chargeback where appropriate.</p>
            <p>Unauthorized or fraudulent chargebacks may result in account review or restrictions.</p>
            <p>This does not affect any rights that cannot legally be waived.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">11. POLICY CHANGES</h2>
            <p>Adventure Records may update this Refund Policy from time to time.</p>
            <p>The latest version will be published on this page.</p>
          </section>

          <section className="space-y-3 border-t border-white/10 pt-6">
            <h2 className="font-heading font-bold text-xl text-white">12. CONTACT</h2>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <p className="font-bold text-white">Adventure Records</p>
              <p className="text-zinc-300">Email: <a href="mailto:adventureof693@gmail.com" className="text-white underline">adventureof693@gmail.com</a></p>
              <p className="text-zinc-300">Website: <a href="https://music-b2696.web.app" className="text-white underline">https://music-b2696.web.app</a></p>
            </div>
          </section>

          <p className="text-xs text-zinc-400 italic pt-4">
            By purchasing services from Adventure Records, you acknowledge that you have read and understood this Refund Policy.
          </p>

        </div>

      </div>
    </div>
  );
};

export default RefundPolicy;
