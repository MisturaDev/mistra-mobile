# Mistra email setup

## Part A — Resend (free, no domain needed)

1. Go to [resend.com](https://resend.com) and create an account
2. Open **API Keys** → **Create API Key** → copy it (`re_...`)
3. For testing without a domain, use sender: `onboarding@resend.dev`

> On Resend free tier, you can only send to **your own verified email** until you add a domain.

---

## Part B — Supabase SMTP

1. Open your Supabase project
2. Go to **Authentication → SMTP Settings**
3. Enable **Custom SMTP**
4. Fill in:

| Field | Value |
|---|---|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | your Resend API key (`re_...`) |
| Sender email | `onboarding@resend.dev` |
| Sender name | `Mistra` |

5. Save

---

## Part C — Email template

1. Go to **Authentication → Email Templates → Confirm signup**
2. **Subject:** `Your verification code is {{ .Token }}`
3. Paste the full HTML from `confirm-signup.html`
4. Save

---

## Part D — Auth settings

1. **Authentication → Providers → Email**
2. Keep **Confirm email** enabled
3. Save

---

## Part E — Test in the app

1. Restart Expo: `npm start`
2. Sign up with the **same email you verified in Resend**
3. Check inbox for email from **Mistra**
4. Enter the 6-digit code on the **Verify your email** screen

---

## When you buy a domain later

1. Add domain in Resend → verify DNS records
2. Change Supabase sender to: `noreply@yourdomain.com`
3. No app code changes needed
