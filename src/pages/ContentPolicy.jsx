import React from 'react';
import { ShieldAlert, Mail, Globe } from 'lucide-react';

const ContentPolicy = () => {
  return (
    <div className="relative pt-12 pb-24 min-h-screen bg-[#070709] text-zinc-300 font-outfit">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="space-y-4 border-b border-white/10 pb-8 text-center sm:text-left">
          <div className="minimal-badge">Platform Rules</div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight">
            CONTENT POLICY
          </h1>
          <p className="text-zinc-400 text-sm">
            Last Updated: September 3, 2026 • Adventure Records Safety & Compliance
          </p>
        </div>

        {/* Policy Body */}
        <div className="space-y-8 text-sm leading-relaxed font-normal">
          
          <p className="text-base text-zinc-200">
            Adventure Records is committed to providing a safe, professional and reliable music distribution platform for independent artists, producers, labels and rights holders.
          </p>

          <p className="text-zinc-400">
            This Content Policy explains the types of content that may and may not be submitted through Adventure Records.
          </p>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">1. ACCEPTABLE CONTENT</h2>
            <p>Users may submit original or properly authorized:</p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400 grid grid-cols-1 sm:grid-cols-2 gap-1">
              <li>Music recordings</li>
              <li>Albums</li>
              <li>EPs</li>
              <li>Singles</li>
              <li>Music videos</li>
              <li>Instrumentals</li>
              <li>Podcasts or other audio content where supported</li>
              <li>Artwork</li>
              <li>Lyrics</li>
              <li>Artist information</li>
              <li>Release metadata</li>
            </ul>
            <p>Users must have the necessary rights and permissions for everything included in a release.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">2. PROHIBITED CONTENT</h2>
            <p>Users must not upload or distribute content that:</p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Infringes copyright</li>
              <li>Violates trademark rights</li>
              <li>Contains stolen recordings</li>
              <li>Uses unauthorized samples</li>
              <li>Contains unauthorized remixes</li>
              <li>Uses another artist's identity deceptively</li>
              <li>Contains fraudulent metadata</li>
              <li>Contains intentionally misleading information</li>
              <li>Attempts to manipulate streaming services</li>
              <li>Uses fake streams or artificial engagement</li>
              <li>Contains malware or malicious files</li>
              <li>Attempts to abuse the Adventure Records platform</li>
              <li>Violates applicable laws</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">3. STREAMING MANIPULATION</h2>
            <p>Adventure Records does not permit artificial streaming or manipulation of music platforms.</p>
            <p>Examples include:</p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Buying fake streams</li>
              <li>Using bots</li>
              <li>Automated streaming</li>
              <li>Stream farms</li>
              <li>Artificial playlist manipulation</li>
              <li>Fraudulent listener activity</li>
              <li>Services designed to artificially increase streams</li>
            </ul>
            <p>Such activity may result in:</p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Release removal</li>
              <li>Distribution suspension</li>
              <li>Royalty withholding where permitted</li>
              <li>Account suspension</li>
              <li>Account termination</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">4. IMPERSONATION</h2>
            <p>Users must not intentionally impersonate another artist, label, company, or rights holder.</p>
            <p>Artist names, profile information and release metadata must not be submitted in a way that is intended to deceive listeners or platforms.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">5. MISLEADING METADATA</h2>
            <p>Users must provide accurate metadata.</p>
            <p>Do not intentionally submit:</p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400 grid grid-cols-1 sm:grid-cols-2 gap-1">
              <li>Fake artist names</li>
              <li>Fake featured artists</li>
              <li>False composer information</li>
              <li>False songwriter information</li>
              <li>Incorrect copyright information</li>
              <li>Misleading version titles</li>
              <li>Fake release information</li>
              <li>Incorrect ISRCs</li>
              <li>Incorrect UPC/EAN information</li>
            </ul>
            <p>Adventure Records may reject releases containing misleading or inaccurate metadata.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">6. EXPLICIT CONTENT</h2>
            <p>Users must correctly identify explicit content where required.</p>
            <p>Content containing strong language, sexual themes, graphic violence or other potentially explicit material should be appropriately marked according to applicable platform requirements.</p>
            <p>Incorrect explicit-content labeling may result in release rejection or metadata correction.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">7. ARTWORK REQUIREMENTS</h2>
            <p>Artwork submitted for distribution must be owned, licensed, or otherwise authorized by the user.</p>
            <p>Artwork must not contain:</p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Unauthorized copyrighted images</li>
              <li>Misleading branding</li>
              <li>Unauthorized celebrity images</li>
              <li>Hate symbols</li>
              <li>Illegal content</li>
              <li>Misleading platform logos</li>
              <li>False claims</li>
              <li>Content designed to deceive listeners</li>
            </ul>
            <p>Artwork must also comply with the requirements of the digital platforms to which the release is delivered.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">8. AI-GENERATED CONTENT</h2>
            <p>If AI-generated or AI-assisted content is used, users are responsible for ensuring that its use complies with applicable laws, platform policies, licensing requirements and third-party rights.</p>
            <p>Users must not use AI to impersonate another person or artist in a deceptive or unauthorized manner.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">9. ILLEGAL CONTENT</h2>
            <p>Adventure Records does not permit content that promotes or facilitates illegal activities.</p>
            <p>Content may be restricted where required by law or applicable platform rules.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">10. HATE AND ABUSIVE CONTENT</h2>
            <p>Content that promotes hatred, violence, or discrimination against protected groups may be restricted or removed.</p>
            <p>Adventure Records may also restrict content that presents serious threats or targeted harassment.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">11. SEXUAL OR EXTREME CONTENT</h2>
            <p>Content that violates applicable platform standards or contains prohibited sexual, exploitative, or extremely graphic material may be rejected.</p>
            <p>Users are responsible for complying with the content requirements of the platforms receiving their releases.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">12. FRAUD AND DECEPTION</h2>
            <p>Users must not use Adventure Records to commit fraud or deceive:</p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400 grid grid-cols-2 gap-1">
              <li>Listeners</li>
              <li>Artists</li>
              <li>Labels</li>
              <li>Rights holders</li>
              <li>Digital platforms</li>
              <li>Payment providers</li>
              <li>Adventure Records</li>
            </ul>
            <p>Fraudulent activity may result in immediate account restrictions.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">13. RELEASE REVIEW</h2>
            <p>Adventure Records may review submitted releases for:</p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Metadata accuracy</li>
              <li>Copyright concerns</li>
              <li>Content violations</li>
              <li>Fraud indicators</li>
              <li>Platform compliance</li>
              <li>Technical requirements</li>
            </ul>
            <p>A release may be placed into review if additional information is required.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">14. REJECTION OR REMOVAL</h2>
            <p>Adventure Records may reject, delay, restrict, or remove content when it reasonably believes that the content:</p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Violates this policy</li>
              <li>Violates applicable law</li>
              <li>Violates platform requirements</li>
              <li>Infringes third-party rights</li>
              <li>Contains fraudulent information</li>
              <li>Creates significant risk to the platform or rights holders</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">15. USER RESPONSIBILITY</h2>
            <p>The user who uploads a release is responsible for ensuring that the content is lawful and properly authorized.</p>
            <p>Adventure Records does not transfer responsibility for rights clearance to the user or third-party rights holder.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">16. POLICY ENFORCEMENT</h2>
            <p>Depending on the circumstances, Adventure Records may:</p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Request additional documentation</li>
              <li>Request metadata corrections</li>
              <li>Reject a release</li>
              <li>Delay distribution</li>
              <li>Remove a release</li>
              <li>Suspend an account</li>
              <li>Terminate an account</li>
              <li>Restrict future submissions</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">17. APPEALS</h2>
            <p>If you believe your release was incorrectly restricted or rejected, you may contact Adventure Records support.</p>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mt-2 space-y-1 text-xs text-zinc-300">
              <p className="font-semibold text-white">Include in your appeal:</p>
              <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                <li>Account email</li>
                <li>Release title</li>
                <li>Artist name</li>
                <li>Release ID</li>
                <li>Explanation of the issue</li>
                <li>Supporting documents, where applicable</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">18. POLICY CHANGES</h2>
            <p>Adventure Records may update this Content Policy as its services and platform requirements change.</p>
            <p>The latest version will be published on this page.</p>
          </section>

          <section className="space-y-3 border-t border-white/10 pt-6">
            <h2 className="font-heading font-bold text-xl text-white">19. CONTACT</h2>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <p className="font-bold text-white">Adventure Records</p>
              <p className="text-zinc-300">Email: <a href="mailto:adventureof693@gmail.com" className="text-white underline">adventureof693@gmail.com</a></p>
              <p className="text-zinc-300">Website: <a href="https://music-b2696.web.app" className="text-white underline">https://music-b2696.web.app</a></p>
            </div>
          </section>

          <p className="text-xs text-zinc-400 italic pt-4">
            By submitting content to Adventure Records, you confirm that your content complies with this Content Policy and that you have the necessary rights and permissions to distribute it.
          </p>

        </div>

      </div>
    </div>
  );
};

export default ContentPolicy;
