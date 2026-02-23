/* eslint-disable react/no-unescaped-entities */

export const metadata = {
  title: "Privacy Policy | PureDraft HR",
  description:
    "PureDraft HR Privacy Policy - No data storage, stateless processing",
};

export default function PrivacyPage() {
  return (
    <div className="space-y-6 prose prose-invert max-w-none dark:prose-invert">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">
          Stateless Architecture & Data Privacy
        </h2>
        <p>
          <strong>
            PureDraft HR is a completely stateless utility application.
          </strong>{" "}
          We are committed to protecting your privacy and ensuring you have a
          positive experience on our platform.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">No Data Storage</h2>
        <p>
          <strong>No data is ever stored:</strong>
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            Your uploaded files (PDF, DOCX, TXT) are never saved to any server
            or database
          </li>
          <li>Generated documents are never stored on our infrastructure</li>
          <li>
            All processing is ephemeral and occurs only in-memory during your
            session
          </li>
          <li>Once your session ends, all data is permanently discarded</li>
          <li>
            We do not maintain logs of your uploaded content or generated output
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">How Your Data is Processed</h2>
        <p>Open Generative AI (Google Gemini API) processes your documents:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>File text is extracted in your browser</li>
          <li>
            This extracted text is transmitted directly to Google&apos;s Gemini
            API (via Vercel&apos;s secure infrastructure)
          </li>
          <li>
            Google processes the text according to their own privacy terms
          </li>
          <li>The generated response is returned to your browser</li>
          <li>All communication uses HTTPS encryption</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Employee Data Safety</h2>
        <p>
          <strong>
            Employee personal information is never retained by PureDraft HR:
          </strong>
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            If you include employee names, IDs, or other personal data in your
            documents, this data is only temporarily processed in-memory
          </li>
          <li>
            We do not store, log, or retain any employee personal information
          </li>
          <li>All processing is transient and session-specific</li>
          <li>Once your browser tab is closed, all data is gone</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Browser-Level Data</h2>
        <p>Minimal non-personal data may be processed:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            Theme preference (dark/light) is stored only in your browser's
            localStorage
          </li>
          <li>No tracking cookies or analytics are deployed</li>
          <li>No third-party scripts collect your browsing behavior</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Third-Party Services</h2>
        <p>We use only essential third-party services:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Google Gemini API:</strong> For AI-powered document
            processing. See Google's privacy policy at
            https://policies.google.com/privacy
          </li>
          <li>
            <strong>Vercel:</strong> For secure hosting and API routing. See
            Vercel's privacy policy
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Your Rights</h2>
        <p>Since we do not store any of your personal data:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>There is no personal data to request, access, or delete</li>
          <li>
            Once you close your session, all your data is automatically erased
          </li>
          <li>You have full control over what data you upload or generate</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. Your continued
          use of PureDraft HR constitutes acceptance of any changes. We
          encourage you to review this policy periodically.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at{" "}
          <a
            href="mailto:eniolorundasamson@gmail.com"
            className="text-blue-500 hover:underline"
          >
            eniolorundasamson@gmail.com
          </a>
        </p>
      </section>

      <p className="text-sm italic">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </div>
  );
}
