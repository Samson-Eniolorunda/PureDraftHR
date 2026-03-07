# PureDraft HR — Email Setup Guide

All steps needed to get `support@puredrafthr.btbcoder.site` working for receiving emails and replying professionally.

> **Note on Resend free plan**: Resend's free tier only allows 1 verified domain, which is already in use by another project. Contact form notifications will arrive from `onboarding@resend.dev` (only you see this). Users on the website see `support@puredrafthr.btbcoder.site` and your replies go out as `support@` — your personal email is never exposed. If you upgrade Resend in the future, verify `puredrafthr.btbcoder.site` to send from `support@` directly.

---

## Prerequisites

- **DNS Provider**: Namecheap (default nameservers) for `btbcoder.site`
- **Transactional Email**: Resend (free plan — 1 domain limit, API key in `.env.local`)
- **Auth**: Clerk (free plan — custom email templates not available)
- **Hosting**: Vercel

---

## Step 1: Add Vercel Environment Variable

The app uses `RESEND_FROM_EMAIL` to set the sender address. You already added it to `.env.local` for local dev — now add it to Vercel for production.

1. Go to [Vercel Dashboard](https://vercel.com/) → your PureDraftHR project
2. **Settings** → **Environment Variables**
3. Add:

| Key                | Value                                                  | Environments       |
|--------------------|--------------------------------------------------------|---------------------|
| `RESEND_FROM_EMAIL`| `PureDraft HR <support@puredrafthr.btbcoder.site>`     | Production, Preview |

4. Click **Save**
5. **Redeploy** the project (Settings → Deployments → redeploy latest, or push a new commit)

---

## Step 2: Set Up Inbound Email Forwarding (ImprovMX)

This forwards emails sent **to** `support@puredrafthr.btbcoder.site` into your Gmail inbox.

1. Go to [ImprovMX](https://improvmx.com/) and sign up (free plan works)
2. Click **Add Domain** → enter `puredrafthr.btbcoder.site`
3. Add a forwarding rule:
   - **Alias**: `support`
   - **Forward to**: `eniolorundasamson@gmail.com`
4. ImprovMX will show you **MX records** to add
5. Go to **Namecheap → Advanced DNS** for `btbcoder.site`
6. Add these MX records:

| Type | Host           | Value                 | Priority |
|------|----------------|-----------------------|----------|
| MX   | `puredrafthr`  | `mx1.improvmx.com`   | 10       |
| MX   | `puredrafthr`  | `mx2.improvmx.com`   | 20       |

> **Important**: The Host is `puredrafthr` (not the full domain — Namecheap appends `.btbcoder.site` automatically).

7. Wait for DNS propagation (usually 5–30 minutes)
8. Test by sending an email to `support@puredrafthr.btbcoder.site` from another account — it should arrive in your Gmail

---

## Step 3: Gmail "Send As" (Reply as support@)

This lets you **reply** to emails from Gmail using `support@puredrafthr.btbcoder.site` so your personal Gmail stays hidden.

1. Open [Gmail](https://mail.google.com/) → click the **gear icon** → **See all settings**
2. Go to **Accounts and Import** tab
3. Under **"Send mail as"**, click **Add another email address**
4. Fill in:
   - **Name**: `PureDraft HR Support`
   - **Email**: `support@puredrafthr.btbcoder.site`
   - Uncheck **"Treat as an alias"**
5. Click **Next Step**
6. Enter SMTP settings:

| Setting       | Value                  |
|---------------|------------------------|
| SMTP Server   | `smtp.resend.com`      |
| Port          | `465`                  |
| Username      | `resend`               |
| Password      | *(your Resend API key)*|
| Security      | **SSL**                |

7. Click **Add Account**
8. Gmail will send a confirmation code to `support@puredrafthr.btbcoder.site`
   - This will be forwarded to your Gmail via ImprovMX (Step 2 must be done first!)
   - Enter the confirmation code
9. Back in Settings → "Send mail as", click **make default** next to the support@ address (optional — makes it the default sender)

---

## Step 4: Clerk Email Templates (Paid Plan Only)

Custom Clerk email templates require a **paid Clerk plan**. On the free plan, Clerk uses its default templates.

If you upgrade to a paid plan in the future:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/) → **Customization** → **Emails**
2. The file `clerk-email-templates.html` in this repo contains 6 branded templates:
   - Verification Code
   - Account Locked
   - Password Changed
   - Password Removed
   - Primary Email Changed
   - Sign in from New Device
3. For each template: copy the HTML between the `<!-- START -->` and `<!-- END -->` markers and paste it into the Clerk email body editor
4. Update the **Name**, **From**, and **Reply-to** fields as noted in the HTML comments above each template

---

## Verification Checklist

After completing all steps, test each one:

- [ ] **Vercel env var added** — `RESEND_FROM_EMAIL` shows in Vercel project settings
- [ ] **Contact form email works** — Submit the contact form on the live site, check your Gmail for the branded email (From will show `onboarding@resend.dev`)
- [ ] **Inbound forwarding works** — Send an email to `support@puredrafthr.btbcoder.site`, it arrives in Gmail
- [ ] **Reply as support@ works** — Reply to an email from Gmail, recipient sees `support@puredrafthr.btbcoder.site`

---

## DNS Records Summary (Namecheap)

All DNS records to add for `btbcoder.site` in Namecheap Advanced DNS:

| Type | Host           | Value                 | Priority |
|------|----------------|-----------------------|----------|
| MX   | `puredrafthr`  | `mx1.improvmx.com`   | 10       |
| MX   | `puredrafthr`  | `mx2.improvmx.com`   | 20       |

> **Note**: If you upgrade Resend to a paid plan in the future, you'll also need to add SPF, DKIM, and DMARC records for `puredrafthr.btbcoder.site` (shown in the Resend dashboard when you verify the domain).
