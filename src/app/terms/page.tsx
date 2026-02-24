/* eslint-disable react/no-unescaped-entities */

export const metadata = {
  title: "Terms of Service | PureDraft HR",
  description: "PureDraft HR Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="space-y-6 prose prose-invert max-w-none dark:prose-invert">
      <h1 className="text-3xl font-bold">Terms of Service</h1>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">1. Agreement to Terms</h2>
        <p>
          By accessing and using PureDraft HR, you accept and agree to be bound
          by the terms and provision of this agreement. If you do not agree to
          abide by the above, please leave this website.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">2. Use License</h2>
        <p>
          Permission is granted to temporarily download one copy of the
          materials (information or software) on PureDraft HR for personal,
          non-commercial transitory viewing only. This is the grant of a
          license, not a transfer of title, and under this license you may not:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>Modify or copy the materials</li>
          <li>
            Use the materials for any commercial purpose or for any public
            display
          </li>
          <li>Attempt to decompile or reverse engineer any software</li>
          <li>
            Remove any copyright or other proprietary notations from the
            materials
          </li>
          <li>
            Transferring the materials to another person or "mirroring" the
            materials on any other server
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">
          3. Stateless Processing & No Storage
        </h2>
        <p>
          <strong>
            Critical: PureDraft HR is a stateless utility application.
          </strong>
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            No employee data, uploaded files, or generated text is ever stored
            on any server or database
          </li>
          <li>
            All data processing occurs temporarily and only in-memory during
            your session
          </li>
          <li>
            Once your browser session ends, all data is permanently erased
          </li>
          <li>
            We do not maintain backups or historical records of your uploads or
            outputs
          </li>
          <li>
            You are solely responsible for retaining copies of any generated
            documents
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">4. Gemini AI Processing & Accuracy Disclaimer</h2>
        <p>
          <strong>PureDraft HR uses Google Gemini AI to generate documents.</strong> Please be aware:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Gemini AI can make mistakes:</strong> Generated content may contain errors, inaccuracies, or incomplete information
          </li>
          <li>
            You are solely responsible for reviewing all AI-generated documents before using them
          </li>
          <li>
            Always verify facts, figures, and legal language with subject matter experts
          </li>
          <li>
            PureDraft HR and Google disclaim liability for errors or omissions in AI-generated output
          </li>
          <li>
            Do not rely solely on AI-generated documents for legal, compliance, or critical HR decisions
          </li>
          <li>
            <strong>Review and edit all output:</strong> Customize generated documents to match your specific organizational needs and policies
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">5. Disclaimer of Warranties</h2>
        <p>
          The materials on PureDraft HR are provided on an 'as is' basis.
          PureDraft HR makes no warranties, expressed or implied, and hereby
          disclaims and negates all other warranties including, without
          limitation, implied warranties or conditions of merchantability,
          fitness for a particular purpose, or non-infringement of intellectual
          property or other violation of rights.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">6. Limitations of Liability</h2>
        <p>
          In no event shall PureDraft HR or its suppliers be liable for any
          damages (including, without limitation, damages for loss of data or
          profit, or due to business interruption) arising out of the use or
          inability to use the materials on PureDraft HR, even if we or our
          authorized representative has been notified orally or in writing of
          the possibility of such damage.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">7. Accuracy of Materials</h2>
        <p>
          The materials appearing on PureDraft HR could include technical,
          typographical, or photographic errors. PureDraft HR does not warrant
          that any of the materials on its website are accurate, complete, or
          current. PureDraft HR may make changes to the materials contained on
          its website at any time without notice.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">
          8. Materials & Content Ownership
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li>The materials appearing on PureDraft HR are copyrighted</li>
          <li>You retain all rights to any documents you upload or generate</li>
          <li>
            By using this tool, you grant us permission to temporarily process
            your content only for the purpose of generating the requested output
          </li>
          <li>We do not claim ownership of any documents you create</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">9. Limitations on Use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Harass or cause distress or inconvenience to any person</li>
          <li>Transmit obscene, offensive or inflammatory material</li>
          <li>Disrupt the normal flow of dialogue within our website</li>
          <li>Use any unlawful means to generate documents</li>
          <li>
            Use the app for illegal activities or in violation of any laws
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">10. Governing Law</h2>
        <p>
          These terms and conditions are governed by and construed in accordance
          with the laws of the jurisdiction where the service is provided, and
          you irrevocably submit to the exclusive jurisdiction of the courts in
          that location.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">11. Changes to Terms</h2>
        <p>
          PureDraft HR reserves the right to change these terms and conditions
          at any time by posting updates on this website. Your continued use of
          the site following the posting of revised Terms means that you accept
          and agree to the changes.
        </p>
      </section>

      <p className="text-sm italic">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </div>
  );
}
