/* eslint-disable react/no-unescaped-entities */

export const metadata = {
  title: "FAQ | PureDraft HR",
  description: "Frequently Asked Questions about PureDraft HR",
};

export default function FAQPage() {
  const faqs = [
    {
      q: "Is PureDraft HR really 100% stateless?",
      a: "Yes, absolutely. We do not store any data on our servers. All processing happens in-memory during your session, and everything is erased when you close the browser or end your session.",
    },
    {
      q: "What happens to my uploaded documents?",
      a: "Your uploaded documents are never saved to any database or server. They are extracted in your browser, sent to Google's Gemini API for processing, and then permanently discarded. Only the session duration matters.",
    },
    {
      q: "Can you access my employee data if I process sensitive documents?",
      a: "No. We have no storage mechanism, no backup system, and no ability to access any data after your session ends. If you include employee names or sensitive information, it is only temporarily in-memory and never retained by PureDraft HR's infrastructure.",
    },
    {
      q: "Is the Google Gemini API processing secure?",
      a: "All communication with Google's Gemini API is encrypted via HTTPS. Google's processing of your data is subject to their own privacy policies. We recommend reviewing Google's Terms of Service and Privacy Policy if you have concerns.",
    },
    {
      q: "Can I trust this tool with sensitive HR documents?",
      a: "PureDraft HR is stateless and does not store data. However, all content is temporarily transmitted to Google's Gemini API. If you have highly sensitive information (e.g., social security numbers, passwords), you should encrypt or redact these values before uploading, as a precaution.",
    },
    {
      q: "Do you track my activity or use analytics?",
      a: "No. We do not use tracking cookies, analytics scripts, or any third-party services to monitor your behavior. Your only local data is your theme preference (dark/light mode), which is stored only in your browser.",
    },
    {
      q: "What is 'Reference Template' feature?",
      a: "The Reference Template is an optional upload field available on the Formatter and Builder pages. If you upload an existing document, PureDraft HR will analyze its structure, tone, and formatting, then generate new content that perfectly mimics that style. This is useful for maintaining consistency with your organization's document standards.",
    },
    {
      q: "Is there a cost to use PureDraft HR?",
      a: "No, PureDraft HR is completely free. We use Google's free tier of the Gemini API, which has generous usage limits for development and general use.",
    },
    {
      q: "Can I use this offline?",
      a: "The UI will work offline (thanks to our Progressive Web App architecture), but AI generation requires an active internet connection and a valid Google Generative AI API key.",
    },
    {
      q: "Can I deploy PureDraft HR myself?",
      a: "Yes! The entire codebase is open-source and ready for you to clone, modify, and deploy. It's optimized for Vercel or any Next.js-compatible hosting platform.",
    },
    {
      q: "What file formats do you support?",
      a: "We support PDF, DOCX (Word), and TXT files. The tool extracts text from these formats and processes it via the AI engine.",
    },
    {
      q: "How long does processing take?",
      a: "Typically 5-15 seconds depending on document length and current API response times. The exact duration depends on Google's Gemini API performance.",
    },
    {
      q: "What if I close the browser mid-process?",
      a: "No problem. Since we don't store anything, simply close the tab or browser. There will be no orphaned data left on our servers.",
    },
    {
      q: "Can I modify the formatter templates or builder document types?",
      a: "Yes! Because this is open-source, you can fork the repository, customize the templates and document types to match your organization's needs, and redeploy.",
    },
    {
      q: "How do I get support?",
      a: "For bugs or feature requests, please open an issue on the GitHub repository at https://github.com/Samson-Eniolorunda/PureDraftHR. For general inquiries, email eniolorundasamson@gmail.com",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">
          Got a question? We've got answers. Learn more about how PureDraft HR
          works.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="group border rounded-lg p-4 hover:bg-accent/50 transition-colors"
          >
            <summary className="cursor-pointer font-semibold group-open:text-primary">
              {faq.q}
            </summary>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              {faq.a}
            </p>
          </details>
        ))}
      </div>

      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">Still have questions?</h2>
        <p>
          Reach out to us at{" "}
          <a
            href="mailto:eniolorundasamson@gmail.com"
            className="text-blue-500 hover:underline"
          >
            eniolorundasamson@gmail.com
          </a>{" "}
          or check out the{" "}
          <a
            href="https://github.com/Samson-Eniolorunda/PureDraftHR"
            className="text-blue-500 hover:underline"
          >
            GitHub repository
          </a>
          .
        </p>
      </div>
    </div>
  );
}
