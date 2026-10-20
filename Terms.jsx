import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Shield, Search, ArrowUp, CheckCircle, Scale, Mail, MapPin, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const termsSections = [
  {
    id: 'section-1',
    title: '1. About Our Services',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-4">
          Adventure Records provides music distribution and related digital music services that allow artists, musicians, labels, producers, and other rights holders (“Users,” “you,” or “your”) to submit music and other content for distribution to selected digital streaming platforms, download stores, social media platforms, and other digital services.
        </p>
        <p className="text-gray-400 font-semibold mb-2">Our Services may include:</p>
        <ul className="list-disc list-inside space-y-2 text-gray-300 pl-2 mb-4">
          <li>Digital music distribution</li>
          <li>Release submission and delivery</li>
          <li>Music and metadata management</li>
          <li>Royalty reporting</li>
          <li>Revenue collection and payment processing</li>
          <li>Release management</li>
          <li>Content delivery to third-party platforms</li>
          <li>Artist and label account management</li>
          <li>Promotional or marketing services, where offered</li>
        </ul>
        <p className="text-gray-400 text-sm italic">
          Distribution destinations may change from time to time. We do not guarantee that your content will be accepted, published, or continuously available on any particular third-party platform.
        </p>
      </>
    )
  },
  {
    id: 'section-2',
    title: '2. Eligibility',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-4">
          You must meet the legal age requirement applicable in your country to use the Services.
        </p>
        <p className="text-gray-300 leading-relaxed mb-4">
          If you are under the applicable legal age, you may use the Services only with the involvement and consent of a parent, legal guardian, or other legally authorized person where required by law.
        </p>
        <p className="text-gray-400 font-semibold mb-2">By using the Services, you represent that:</p>
        <ol className="list-decimal list-inside space-y-2 text-gray-300 pl-2">
          <li>The information you provide is accurate and complete.</li>
          <li>You have the legal authority to enter into these Terms.</li>
          <li>You have all necessary rights and permissions relating to the content you submit.</li>
          <li>Your use of the Services does not violate any applicable law or third-party rights.</li>
        </ol>
      </>
    )
  },
  {
    id: 'section-3',
    title: '3. Creating an Account',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-4">
          Certain Services may require you to create an account.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20">
            <p className="text-purple-300 font-bold text-sm mb-2">You are responsible for:</p>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-gray-300">
              <li>Providing accurate registration information.</li>
              <li>Keeping your login credentials confidential.</li>
              <li>Maintaining the security of your account.</li>
              <li>All activity conducted through your account.</li>
              <li>Immediately notifying us if you believe your account has been compromised.</li>
            </ul>
          </div>
          <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/20">
            <p className="text-red-300 font-bold text-sm mb-2">You must NOT:</p>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-gray-300">
              <li>Create an account using false information.</li>
              <li>Impersonate another person or organization.</li>
              <li>Create an account for fraudulent purposes.</li>
              <li>Share your account credentials with unauthorized persons.</li>
              <li>Attempt to access another user's account.</li>
            </ul>
          </div>
        </div>
        <p className="text-gray-400 text-sm">
          We may suspend or terminate accounts that contain inaccurate, misleading, fraudulent, or unauthorized information.
        </p>
      </>
    )
  },
  {
    id: 'section-4',
    title: '4. Artist and Label Information',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-4">
          You agree to provide accurate information about yourself, your artist name, label name, releases, collaborators, and other information required for distribution.
        </p>
        <p className="text-gray-400 font-semibold mb-2">You are responsible for ensuring that:</p>
        <ul className="list-disc list-inside space-y-1.5 text-gray-300 pl-2 mb-4">
          <li>Artist names are accurate.</li>
          <li>Song titles are accurate.</li>
          <li>Album and release information is accurate.</li>
          <li>Contributor information is accurate.</li>
          <li>Composer and songwriter information is accurate.</li>
          <li>Copyright information is accurate.</li>
          <li>Explicit-content labels are accurate where applicable.</li>
          <li>ISRC, UPC, and other identifiers are accurate where applicable.</li>
        </ul>
        <p className="text-gray-400 text-sm">
          Adventure Records is not responsible for problems caused by incorrect information supplied by you.
        </p>
      </>
    )
  },
  {
    id: 'section-5',
    title: '5. Content You Upload',
    content: (
      <>
        <p className="text-gray-400 font-semibold mb-2">“Content” includes, without limitation:</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {['Sound recordings', 'Music', 'Albums', 'EPs', 'Singles', 'Music videos', 'Artwork', 'Lyrics', 'Artist names', 'Logos', 'Metadata', 'Songwriter info', 'Copyright info', 'Promotional material'].map((item, idx) => (
            <span key={idx} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300">
              {item}
            </span>
          ))}
        </div>
        <p className="text-gray-300 leading-relaxed mb-2">
          You retain ownership of your Content unless otherwise expressly agreed in writing.
        </p>
        <p className="text-purple-300 font-medium text-sm">
          You do not transfer ownership of your Content to Adventure Records merely by using the Services.
        </p>
      </>
    )
  },
  {
    id: 'section-6',
    title: '6. Your Rights and Ownership',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-4">
          You represent and warrant that you either own or have obtained all necessary rights, licenses, permissions, consents, and authorizations required to distribute and monetize the Content you submit.
        </p>
        <p className="text-gray-400 font-semibold mb-2">This may include rights relating to:</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300 text-sm mb-4">
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400 shrink-0" /> Master recordings</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400 shrink-0" /> Musical compositions</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400 shrink-0" /> Lyrics & vocals</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400 shrink-0" /> Samples & Beats</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400 shrink-0" /> Instrumentals</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400 shrink-0" /> Performances</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400 shrink-0" /> Featured artists & Remixers</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-400 shrink-0" /> Artwork & Trademarks</li>
        </ul>
        <p className="text-red-400 text-sm font-semibold">
          You must not submit Content if you do not have the necessary rights to distribute it.
        </p>
      </>
    )
  },
  {
    id: 'section-7',
    title: '7. Samples, Beats, Loops and Third-Party Materials',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          If your Content contains samples, beats, loops, sounds, recordings, or other third-party materials, you are responsible for obtaining all necessary licenses and permissions.
        </p>
        <p className="text-yellow-300/90 text-sm bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl mb-3">
          Purchasing or downloading a beat, sample, loop, or instrumental does not automatically give you unlimited distribution or commercial rights.
        </p>
        <p className="text-gray-300 text-sm mb-2">
          You must ensure that your license permits digital distribution and monetization on the relevant platforms.
        </p>
        <p className="text-gray-400 text-xs italic">
          Adventure Records may request proof of licensing or ownership at any time.
        </p>
      </>
    )
  },
  {
    id: 'section-8',
    title: '8. Cover Songs',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          If you distribute a cover song, you are responsible for obtaining any required mechanical licenses, permissions, or other rights required by applicable law.
        </p>
        <p className="text-gray-300 font-semibold mb-2">
          You must not represent a cover recording as an original composition.
        </p>
        <p className="text-gray-400 text-sm">
          Where required, Adventure Records may request documentation demonstrating that the necessary rights have been obtained.
        </p>
      </>
    )
  },
  {
    id: 'section-9',
    title: '9. AI-Generated Content',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-4">
          If you submit music, vocals, artwork, lyrics, or other Content created wholly or partially using artificial intelligence (“AI”), you are responsible for ensuring that the Content complies with applicable laws, third-party platform policies, and intellectual property requirements.
        </p>
        <p className="text-red-400 font-semibold mb-2 text-sm">You must not submit AI-generated Content that:</p>
        <ul className="list-disc list-inside space-y-1.5 text-xs text-gray-300 pl-2 mb-4">
          <li>Infringes another person's copyright.</li>
          <li>Copies another artist's protected work without authorization.</li>
          <li>Uses a person's voice or likeness without appropriate permission.</li>
          <li>Misleads listeners about the identity of an artist.</li>
          <li>Violates the terms of a third-party AI service.</li>
          <li>Contains unauthorized cloned or imitated vocals.</li>
          <li>Contains unlawfully generated or manipulated material.</li>
        </ul>
        <p className="text-gray-400 text-xs">
          Adventure Records may reject, suspend, or remove AI-generated Content where necessary to comply with law, platform policies, rights-holder complaints, or our internal policies.
        </p>
      </>
    )
  },
  {
    id: 'section-10',
    title: '10. Grant of Distribution Rights',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          By submitting Content through the Services, you grant Adventure Records a limited, non-exclusive, worldwide right and license, during the applicable distribution period, to:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs text-gray-300 pl-2 mb-4">
          <li>Reproduce your Content as necessary for distribution.</li>
          <li>Deliver your Content to digital music services.</li>
          <li>Make your Content available for streaming and/or download.</li>
          <li>Distribute and monetize your Content.</li>
          <li>Store and process your Content.</li>
          <li>Display your artist name, artwork, metadata, and other release information.</li>
          <li>Use your Content and related metadata as reasonably necessary to provide the Services.</li>
        </ul>
        <p className="text-purple-300 text-xs font-semibold">
          This license is limited to providing, operating, administering, promoting, and monetizing the Services and does not transfer ownership of your Content to Adventure Records.
        </p>
      </>
    )
  },
  {
    id: 'section-11',
    title: '11. Third-Party Digital Platforms',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Adventure Records may distribute your Content to third-party platforms, including streaming services, download stores, social media services, content identification systems, and other digital platforms.
        </p>
        <p className="text-gray-400 text-sm mb-2">
          Third-party platforms have their own terms of service, content policies, copyright rules, monetization policies, eligibility requirements, and removal procedures.
        </p>
        <p className="text-gray-400 text-xs italic mb-2">
          We do not control these third-party platforms and cannot guarantee acceptance of your release, publication, specific release dates, placement, revenue levels, or streaming numbers.
        </p>
        <p className="text-gray-400 text-xs">
          A third-party platform may reject, restrict, suspend, demonetize, or remove your Content independently of Adventure Records.
        </p>
      </>
    )
  },
  {
    id: 'section-12',
    title: '12. Release Dates',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          You may request a specific release date. However, release dates are not guaranteed because delivery, review, processing, and publication are controlled partly by third-party platforms.
        </p>
        <p className="text-gray-300 text-sm mb-3">
          You are responsible for submitting releases sufficiently in advance when a specific release date is important.
        </p>
        <p className="text-gray-400 text-xs">
          Adventure Records is not responsible for delays caused by third-party platforms, incorrect metadata, copyright issues, technical problems, content review, missing information, regulatory requirements, or force majeure events.
        </p>
      </>
    )
  },
  {
    id: 'section-13',
    title: '13. Content Review and Approval',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Adventure Records may review Content before distribution. We may reject or delay Content if we reasonably believe it violates these Terms, infringes intellectual property, contains fraudulent streams/activity, or creates legal/financial risk.
        </p>
        <p className="text-gray-400 text-xs italic">
          Approval of Content does not mean that Adventure Records guarantees that the Content is legally compliant or free from third-party claims.
        </p>
      </>
    )
  },
  {
    id: 'section-14',
    title: '14. Copyright and Intellectual Property',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          You must respect the intellectual property rights of others. You must not upload or distribute Content that infringes copyright, trademark, personality/publicity, privacy, performer, moral, or contractual rights.
        </p>
        <p className="text-gray-300 text-sm">
          If you believe Content distributed through Adventure Records infringes your rights, you may contact us with appropriate supporting information. We may remove or restrict allegedly infringing Content while investigating a complaint.
        </p>
      </>
    )
  },
  {
    id: 'section-15',
    title: '15. Copyright Claims and Disputes',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          If a rights holder, artist, songwriter, publisher, label, or other party submits a credible copyright or ownership claim concerning your Content, Adventure Records may:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs text-gray-300 pl-2 mb-3">
          <li>Temporarily suspend the affected release.</li>
          <li>Remove the release from digital platforms.</li>
          <li>Hold related revenue while the dispute is investigated.</li>
          <li>Request ownership or licensing documentation.</li>
          <li>Restrict your account.</li>
          <li>Take other reasonable measures to protect rights holders and the Services.</li>
        </ul>
        <p className="text-gray-400 text-xs">
          You are responsible for resolving disputes concerning Content you submitted where the dispute arises from your rights or representations.
        </p>
      </>
    )
  },
  {
    id: 'section-16',
    title: '16. Royalties and Revenue',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Where applicable, Adventure Records will credit eligible revenue generated by your Content to your account according to the applicable distribution plan, pricing, and revenue-share terms presented to you.
        </p>
        <p className="text-gray-400 text-xs mb-2">
          Revenue received from third-party platforms may be subject to platform deductions, taxes, withholding, refunds, chargebacks, currency conversion, administrative adjustments, and fraud-related adjustments.
        </p>
        <p className="text-gray-400 text-xs italic">
          Third-party reporting may also be delayed. The amount shown in your account may therefore change as reports are updated or corrected.
        </p>
      </>
    )
  },
  {
    id: 'section-17',
    title: '17. Royalty Payments',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          You are responsible for providing accurate payment information (legal name, payment details, tax information, identity verification).
        </p>
        <p className="text-gray-400 text-xs mb-3">
          We may delay or withhold payment where required information is missing, verification is incomplete, fraud or manipulation is suspected, copyright disputes exist, or third-party platforms have withheld/reversed revenue.
        </p>
        <p className="text-purple-300 text-xs font-semibold">
          You are responsible for any taxes applicable to income you receive through the Services.
        </p>
      </>
    )
  },
  {
    id: 'section-18',
    title: '18. Fraudulent Streaming and Artificial Activity',
    content: (
      <>
        <p className="text-red-400 font-bold text-sm mb-2">
          You must not artificially increase streams, views, downloads, followers, or other engagement metrics.
        </p>
        <p className="text-gray-300 text-xs mb-2">Prohibited activities include purchasing streams, using bots, click farms, automated streaming systems, artificial engagement services, manipulating algorithms, or incentivizing fraudulent streams.</p>
        <p className="text-gray-400 text-xs">
          If fraudulent activity is suspected, we may suspend releases, withhold affected revenue, recover previously paid amounts, or terminate your account.
        </p>
      </>
    )
  },
  {
    id: 'section-19',
    title: '19. Prohibited Content',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          You must not use the Services to distribute Content that is illegal, infringing, deceptive, malicious, defamatory, exploits minors, contains unauthorized voice cloning, or promotes violence/harm.
        </p>
        <p className="text-gray-400 text-xs italic">
          We reserve the right to determine whether Content violates these requirements, subject to applicable law.
        </p>
      </>
    )
  },
  {
    id: 'section-20',
    title: '20. Metadata and Artist Identity',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          You must not intentionally use misleading artist names, titles, artwork, metadata, or other information to confuse listeners or benefit from another artist's reputation.
        </p>
        <p className="text-gray-400 text-xs">
          Impersonation of any artist, celebrity, band, label, or company is strictly prohibited.
        </p>
      </>
    )
  },
  {
    id: 'section-21',
    title: '21. Artwork Requirements',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Artwork submitted for distribution must comply with applicable platform requirements and must not contain unauthorized logos, trademarks, celebrity images, or copyrighted artwork.
        </p>
      </>
    )
  },
  {
    id: 'section-22',
    title: '22. Takedown and Removal Requests',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          You may request that your Content be removed from distribution. Processing times depend on third-party platform systems. We may also remove Content without prior notice due to copyright complaints, fraud, or policy breaches.
        </p>
      </>
    )
  },
  {
    id: 'section-23',
    title: '23. Account Suspension and Termination',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          We may suspend or terminate your account if you violate these Terms, submit infringing content, engage in fraudulent activity, provide false information, or fail to pay amounts owed.
        </p>
      </>
    )
  },
  {
    id: 'section-24',
    title: '24. Effect of Termination',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Upon termination, your right to use the Services ends. We may remove your releases, stop future distribution, hold funds where permitted, and retain data as required by law.
        </p>
      </>
    )
  },
  {
    id: 'section-25',
    title: '25. Fees',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Some Services require payment of distribution, subscription, or promotional fees. Prices are disclosed at the time of purchase and fees are non-refundable once processing begins, subject to applicable consumer protection law.
        </p>
      </>
    )
  },
  {
    id: 'section-26',
    title: '26. Refunds',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Refund eligibility depends on the Service purchased and applicable law. Refunds may not be available for services that have already been substantially performed.
        </p>
      </>
    )
  },
  {
    id: 'section-27',
    title: '27. Promotions and Marketing',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Where permitted, Adventure Records may display information about your releases (artist name, title, artwork, promotional excerpts) on our website, social media, or marketing channels to promote the Services. You retain ownership.
        </p>
      </>
    )
  },
  {
    id: 'section-28',
    title: '28. Website and Platform Ownership',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          The Adventure Records website, platform, software, design, branding, logos, text, and user interfaces are protected by intellectual property laws and owned by or licensed to Adventure Records.
        </p>
      </>
    )
  },
  {
    id: 'section-29',
    title: '29. User Feedback',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Any suggestions, ideas, or feedback provided regarding the Services may be used by Adventure Records without restriction or compensation.
        </p>
      </>
    )
  },
  {
    id: 'section-30',
    title: '30. Privacy',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Your use of the Services is subject to our Privacy Policy. By using the Services, you acknowledge that your information may be processed in accordance with our Privacy Policy.
        </p>
      </>
    )
  },
  {
    id: 'section-31',
    title: '31. Third-Party Services',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Our Services may integrate with or link to third-party services. Adventure Records is not responsible for third-party websites, policies, outages, or content.
        </p>
      </>
    )
  },
  {
    id: 'section-32',
    title: '32. Service Availability',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          We aim for uninterrupted service but do not guarantee error-free operation. Services may be unavailable due to maintenance, technical failures, network outages, or circumstances beyond our control.
        </p>
      </>
    )
  },
  {
    id: 'section-33',
    title: '33. No Guarantee of Success',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Adventure Records does not guarantee specific streams, revenue, playlist placement, viral success, or chart performance. Music distribution provides store access; it does not guarantee commercial success.
        </p>
      </>
    )
  },
  {
    id: 'section-34',
    title: '34. Disclaimer',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          To the maximum extent permitted by law, Services are provided on an “as available” and “as is” basis without warranties of any kind.
        </p>
      </>
    )
  },
  {
    id: 'section-35',
    title: '35. Limitation of Liability',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Adventure Records will not be liable for indirect, incidental, consequential, or punitive losses (including loss of profits, revenue, data, or expected royalties) arising from your use of the Services.
        </p>
      </>
    )
  },
  {
    id: 'section-36',
    title: '36. Indemnification',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          You agree to defend, indemnify, and hold harmless Adventure Records from claims, losses, liabilities, damages, costs, and expenses arising from your breach of these Terms, your Content, or your violation of third-party rights.
        </p>
      </>
    )
  },
  {
    id: 'section-37',
    title: '37. Changes to These Terms',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          We may update these Terms from time to time. Material changes will be communicated via our website, account dashboard, or email. Continued use of the Services signifies acceptance of updated Terms.
        </p>
      </>
    )
  },
  {
    id: 'section-38',
    title: '38. Changes to the Services',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          We may modify, suspend, or discontinue parts of the Services, features, pricing structures, or distribution destinations from time to time with appropriate notice where required by law.
        </p>
      </>
    )
  },
  {
    id: 'section-39',
    title: '39. Force Majeure',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Adventure Records will not be responsible for delays or failures caused by natural disasters, war, government action, internet/power failures, cybersecurity incidents, or major third-party platform outages.
        </p>
      </>
    )
  },
  {
    id: 'section-40',
    title: '40. Governing Law',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          These Terms shall be governed by the laws of India applicable to the jurisdiction in which Adventure Records is legally established. Any disputes shall be subject to the jurisdiction of the competent courts in India.
        </p>
      </>
    )
  },
  {
    id: 'section-41',
    title: '41. Dispute Resolution',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Before initiating formal legal proceedings, parties should attempt to resolve disputes in good faith by contacting Adventure Records.
        </p>
      </>
    )
  },
  {
    id: 'section-42',
    title: '42. Severability',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          If any provision of these Terms is found invalid or unenforceable, remaining provisions will continue to apply to the maximum extent permitted by law.
        </p>
      </>
    )
  },
  {
    id: 'section-43',
    title: '43. No Waiver',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          Failure by Adventure Records to immediately enforce any provision does not constitute a waiver of our right to enforce it later.
        </p>
      </>
    )
  },
  {
    id: 'section-44',
    title: '44. Entire Agreement',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          These Terms, together with incorporated policies and service terms, constitute the entire agreement between you and Adventure Records.
        </p>
      </>
    )
  },
  {
    id: 'section-45',
    title: '45. Assignment',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-3">
          You may not transfer your rights or obligations under these Terms without our prior written consent. Adventure Records may assign its rights and obligations in connection with a merger, acquisition, or restructuring.
        </p>
      </>
    )
  },
  {
    id: 'section-46',
    title: '46. Contact Us',
    content: (
      <>
        <p className="text-gray-300 leading-relaxed mb-4">
          If you have questions regarding these Terms, copyright matters, distribution, account issues, or other legal concerns, contact us through the official contact details provided below:
        </p>
        <div className="glass-panel p-6 rounded-2xl border-purple-500/20 space-y-4">
          <h4 className="font-orbitron font-bold text-white text-lg">Adventure Records Support & Legal</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <p className="text-gray-400">Official Website</p>
                <a href="https://adventurerecords.in" target="_blank" rel="noreferrer" className="text-white font-semibold hover:underline">
                  adventurerecords.in
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <p className="text-gray-400">Support & Legal Email</p>
                <a href="mailto:adventureof693@gmail.com" className="text-white font-semibold hover:underline">
                  adventureof693@gmail.com
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <p className="text-gray-400">Business Address</p>
                <p className="text-white font-semibold">
                  Rode bus Stand Complex, Satna, MP, 485005, India
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  },
  {
    id: 'section-47',
    title: '47. Acceptance',
    content: (
      <>
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 space-y-3">
          <p className="text-white font-semibold text-sm">
            By creating an account, submitting Content, purchasing a Service, or using the Adventure Records platform, you confirm that:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-gray-300 pl-2">
            <li>You have read these Terms.</li>
            <li>You understand these Terms.</li>
            <li>You agree to be bound by these Terms.</li>
            <li>You have the necessary rights and permissions for the Content you submit.</li>
            <li>The information you provide is accurate to the best of your knowledge.</li>
          </ul>
          <p className="text-red-400 font-bold text-xs pt-2">
            If you do not agree to these Terms, do not use the Services.
          </p>
        </div>
      </>
    )
  }
];

const Terms = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('section-1');

  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return termsSections;
    const term = searchTerm.toLowerCase();
    return termsSections.filter(
      (sec) =>
        sec.title.toLowerCase().includes(term) ||
        sec.id.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative pt-20 overflow-x-hidden min-h-screen text-gray-200">
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-40 right-[-10%] w-[500px] h-[500px] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-40 left-[-10%] w-[500px] h-[500px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Shield className="w-4 h-4" /> Legal Agreement
        </div>
        <h1 className="font-orbitron font-black text-3xl sm:text-5xl text-white">
          TERMS OF <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">USE</span>
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm max-w-2xl mx-auto">
          <strong>Last Updated:</strong> September 1, 2026
        </p>
        <p className="text-gray-300 text-sm max-w-3xl mx-auto leading-relaxed pt-2">
          Welcome to <strong>Adventure Records</strong> (“Adventure Records,” “we,” “us,” or “our”). These Terms of Use (“Terms”) govern your access to and use of our website, platform, music distribution services, applications, and related services (collectively, the “Services”).
        </p>
      </section>

      {/* Search and Navigation Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="glass-panel p-4 rounded-2xl border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search terms (e.g. Royalties, AI, Samples)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <span>Showing {filteredSections.length} of {termsSections.length} sections</span>
          </div>
        </div>
      </section>

      {/* Main Content Layout with Table of Contents Sidebar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Quick Table of Contents Sidebar */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-28 glass-panel p-5 rounded-3xl border-white/10 max-h-[calc(100vh-140px)] overflow-y-auto space-y-2 text-xs custom-scrollbar">
              <h3 className="font-orbitron font-bold text-white uppercase text-xs tracking-wider mb-3 px-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" /> Table of Contents
              </h3>
              {termsSections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all duration-200 truncate ${
                    activeSection === sec.id
                      ? 'bg-purple-600/30 border border-purple-500/40 text-purple-200 font-semibold'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {sec.title}
                </button>
              ))}
            </div>
          </aside>

          {/* Main Terms Content */}
          <main className="lg:col-span-8 space-y-6">
            {filteredSections.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl text-center space-y-4">
                <p className="text-gray-400 text-sm">No sections match your search "{searchTerm}".</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold"
                >
                  Clear Search Filter
                </button>
              </div>
            ) : (
              filteredSections.map((sec) => (
                <motion.div
                  key={sec.id}
                  id={sec.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                  className="glass-panel p-6 sm:p-8 rounded-3xl border-white/5 hover:border-purple-500/30 transition-all scroll-mt-28"
                >
                  <h2 className="font-orbitron font-bold text-lg sm:text-xl text-white mb-4 pb-3 border-b border-white/5">
                    {sec.title}
                  </h2>
                  <div className="text-xs sm:text-sm text-gray-300">
                    {sec.content}
                  </div>
                </motion.div>
              ))
            )}

            {/* Back to top button floating control */}
            <div className="flex justify-between items-center pt-8 border-t border-white/5">
              <Link to="/contact" className="text-xs text-purple-400 hover:underline">
                Have questions about these terms? Contact Support
              </Link>
              <button
                onClick={scrollToTop}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-purple-600 hover:border-purple-500 text-xs text-white transition-all"
              >
                <ArrowUp className="w-3.5 h-3.5" /> Back to Top
              </button>
            </div>
          </main>

        </div>
      </section>

    </div>
  );
};

export default Terms;
