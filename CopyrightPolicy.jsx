import React from 'react';
import { ShieldCheck, Mail, Globe } from 'lucide-react';

const CopyrightPolicy = () => {
  return (
    <div className="relative pt-12 pb-24 min-h-screen bg-[#070709] text-zinc-300 font-outfit">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="space-y-4 border-b border-white/10 pb-8 text-center sm:text-left">
          <div className="minimal-badge">Legal Documentation</div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight">
            COPYRIGHT POLICY
          </h1>
          <p className="text-zinc-400 text-sm">
            Last Updated: September 3, 2026 • Adventure Records Global Compliance
          </p>
        </div>

        {/* Policy Body */}
        <div className="space-y-8 text-sm leading-relaxed font-normal">
          
          <p className="text-base text-zinc-200">
            Adventure Records respects the intellectual property rights of artists, copyright owners, record labels, composers, publishers, and other rights holders.
          </p>

          <p className="text-zinc-400">
            This Copyright Policy explains how copyright-related issues are handled on the Adventure Records platform.
          </p>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">1. COPYRIGHT OWNERSHIP</h2>
            <p>Users must only upload and distribute music for which they:</p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Own the necessary rights; or</li>
              <li>Have obtained proper authorization or licenses from the relevant rights holders.</li>
            </ul>
            <p>Uploading music to Adventure Records does not transfer ownership of your copyright to Adventure Records.</p>
            <p>You remain responsible for ensuring that your content does not infringe the rights of another person or organization.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">2. USER RESPONSIBILITY</h2>
            <p>Before submitting music, you must make sure that you have the necessary rights to distribute:</p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400 grid grid-cols-1 sm:grid-cols-2 gap-1">
              <li>Sound recordings</li>
              <li>Music videos</li>
              <li>Artwork</li>
              <li>Lyrics</li>
              <li>Compositions</li>
              <li>Samples</li>
              <li>Remixes</li>
              <li>Beats</li>
              <li>Performances</li>
              <li>Other materials included in the release</li>
            </ul>
            <p>If your release contains samples, interpolations, third-party compositions, or other protected material, you must obtain all required permissions before distribution.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">3. COPYRIGHT INFRINGEMENT</h2>
            <p>Adventure Records does not permit users to upload or distribute content that infringes another person's copyright or intellectual property rights.</p>
            <p>Examples include:</p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Unauthorized music</li>
              <li>Stolen recordings</li>
              <li>Unauthorized remixes</li>
              <li>Unlicensed samples</li>
              <li>Unauthorized artwork</li>
              <li>Copyrighted material submitted without permission</li>
              <li>Music belonging to another artist or label</li>
              <li>Content obtained through unauthorized sources</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">4. COPYRIGHT COMPLAINTS</h2>
            <p>If you believe that content distributed through Adventure Records infringes your copyright, you may contact us with the relevant information.</p>
            <p>A copyright complaint should include:</p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Your full name</li>
              <li>Contact information</li>
              <li>Identification of the copyrighted work</li>
              <li>Identification of the allegedly infringing content</li>
              <li>The URL or release information, if available</li>
              <li>A description of why you believe the content infringes your rights</li>
              <li>Evidence supporting your claim</li>
              <li>A statement confirming that the information provided is accurate</li>
            </ul>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mt-3 space-y-1">
              <p className="font-semibold text-white">Send copyright complaints to:</p>
              <p className="text-zinc-300">Email: <a href="mailto:adventureof693@gmail.com" className="text-white underline font-semibold">adventureof693@gmail.com</a></p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">5. REVIEW OF COPYRIGHT CLAIMS</h2>
            <p>Adventure Records may review copyright complaints and request additional information or documentation from the parties involved.</p>
            <p>Depending on the circumstances, we may:</p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Temporarily restrict a release</li>
              <li>Delay distribution</li>
              <li>Remove or disable a release</li>
              <li>Request proof of ownership</li>
              <li>Request authorization documents</li>
              <li>Contact the uploader</li>
              <li>Take other reasonable actions to address the complaint</li>
            </ul>
            <p>Submitting a copyright complaint does not automatically guarantee removal of content.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">6. COUNTERCLAIM / DISPUTE</h2>
            <p>If a release has been restricted because of a copyright complaint, the uploader may contact Adventure Records with evidence demonstrating that they have the necessary rights or authorization.</p>
            <p>Adventure Records may review the submitted information before deciding whether distribution can continue.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">7. REPEAT INFRINGEMENT</h2>
            <p>Adventure Records may take action against users who repeatedly submit content that infringes copyright.</p>
            <p>Depending on the circumstances, actions may include:</p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Release removal</li>
              <li>Distribution restrictions</li>
              <li>Account suspension</li>
              <li>Account termination</li>
              <li>Other appropriate measures</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">8. FALSE COPYRIGHT CLAIMS</h2>
            <p>Users must not knowingly submit false or misleading copyright complaints.</p>
            <p>False or fraudulent claims may result in account restrictions or other appropriate action.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">9. COPYRIGHT DOES NOT EQUAL DISTRIBUTION RIGHTS</h2>
            <p>Having access to a recording does not necessarily mean that you have the legal right to distribute it.</p>
            <p>Users are responsible for obtaining all required rights, licenses, permissions, clearances and consents.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">10. ADVENTURE RECORDS' ROLE</h2>
            <p>Adventure Records provides music distribution and related services.</p>
            <p>Adventure Records does not determine ownership of every piece of music uploaded to the platform.</p>
            <p>Users remain responsible for the legality and authorization of their submissions.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">11. POLICY CHANGES</h2>
            <p>Adventure Records may update this Copyright Policy from time to time.</p>
            <p>Updated versions will be published on this page.</p>
          </section>

          <section className="space-y-3 border-t border-white/10 pt-6">
            <h2 className="font-heading font-bold text-xl text-white">12. CONTACT</h2>
            <p>For copyright-related matters:</p>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <p className="font-bold text-white">Adventure Records</p>
              <p className="text-zinc-300">Email: <a href="mailto:adventureof693@gmail.com" className="text-white underline">adventureof693@gmail.com</a></p>
              <p className="text-zinc-300">Website: <a href="https://music-b2696.web.app" className="text-white underline">https://music-b2696.web.app</a></p>
            </div>
          </section>

          <p className="text-xs text-zinc-400 italic pt-4">
            By submitting content to Adventure Records, you acknowledge that you are responsible for ensuring that you have the necessary rights to distribute the content.
          </p>

        </div>

      </div>
    </div>
  );
};

export default CopyrightPolicy;
