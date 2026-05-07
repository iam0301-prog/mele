import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ENV_FILES = [
  resolve('.env.auth.local'),
  resolve('apps/web/.env.local'),
  resolve('.env.local'),
  resolve('.env'),
];

function parseEnvFile(file) {
  if (!existsSync(file)) return {};
  const result = {};

  for (const rawLine of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^([^=]+)=(.*)$/);
    if (!match) continue;
    result[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }

  return result;
}

const env = Object.assign({}, ...ENV_FILES.map(parseEnvFile), process.env);
const args = new Set(process.argv.slice(2));
const apply = args.has('--apply');
const statusOnly = args.has('--status');
const help = args.has('--help') || args.has('-h');

function usage() {
  console.log(`Usage:
  npm run ops:configure-auth -- --dry-run
  npm run ops:configure-auth -- --apply
  npm run ops:configure-auth -- --status

Required secrets are read from .env.auth.local or process env.
.env.auth.local is ignored by git.

Required:
  SUPABASE_ACCESS_TOKEN=<Supabase personal access token>
  MELE_SMTP_PASS=<Resend API key or SMTP password>
  MELE_SMTP_ADMIN_EMAIL=<verified sender email>

Recommended:
  MELE_AUTH_SITE_URL=https://mele-chi.vercel.app
  MELE_EXTRA_REDIRECT_URLS=https://mele-chi.vercel.app/**,http://localhost:3000/**,http://127.0.0.1:3006/**
  MELE_SMTP_HOST=smtp.resend.com
  MELE_SMTP_PORT=465
  MELE_SMTP_USER=resend
  MELE_SMTP_SENDER_NAME=MELE`);
}

if (help) {
  usage();
  process.exit(0);
}

function info(message) {
  console.log(`INFO ${message}`);
}

function ok(message) {
  console.log(`OK   ${message}`);
}

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
}

function required(name, value) {
  if (!value) {
    fail(`${name} is required.`);
    return '';
  }
  return value;
}

function deriveProjectRef() {
  if (env.SUPABASE_PROJECT_REF) return env.SUPABASE_PROJECT_REF;
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const match = url?.match(/^https:\/\/([a-z0-9]{20})\.supabase\.co\/?$/i);
  return match?.[1] ?? '';
}

function normalizeUrl(value) {
  return value.replace(/\/+$/, '');
}

function isLocalUrl(value) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(value);
}

function mask(value) {
  if (!value) return '<missing>';
  if (value.length <= 8) return '<set>';
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function redactConfig(config) {
  const clone = { ...config };
  if (clone.smtp_pass) clone.smtp_pass = mask(clone.smtp_pass);
  for (const key of Object.keys(clone)) {
    if (key.startsWith('mailer_templates_') && typeof clone[key] === 'string') {
      clone[key] = `<${clone[key].length} chars>`;
    }
  }
  return clone;
}

function mailTemplate({
  title,
  eyebrow,
  body,
  button,
  fallback,
  englishTitle,
  englishEyebrow,
  englishBody,
  englishButton,
  englishFallback,
}) {
  return `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
  </head>
  <body style="margin:0;background:#07111f;color:#f8f0dd;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans TC','Microsoft JhengHei',Arial,sans-serif;line-height:1.7;">
    <div style="display:none;max-height:0;overflow:hidden;color:transparent;">${fallback} ${englishFallback}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#07111f;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;border:1px solid rgba(225,190,88,.42);border-radius:18px;background:#0b1727;">
            <tr>
              <td style="padding:28px 26px 10px;">
                <div style="letter-spacing:.22em;color:#e1be58;font-size:12px;font-weight:700;">MELE</div>
                <h1 style="margin:12px 0 8px;font-size:26px;line-height:1.25;color:#fff7df;font-family:Georgia,'Times New Roman',serif;">${title}</h1>
                <p style="margin:0;color:#9de4ee;font-size:13px;font-weight:700;">${eyebrow}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 26px 8px;color:#e8dfcc;font-size:15px;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 26px 4px;">
                <div style="height:1px;background:rgba(225,190,88,.28);line-height:1px;font-size:1px;">&nbsp;</div>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 26px 8px;color:#e8dfcc;font-size:15px;">
                <p style="margin:0 0 8px;color:#9de4ee;font-size:13px;font-weight:700;letter-spacing:.12em;">ENGLISH VERSION</p>
                <h2 style="margin:0 0 8px;font-size:20px;line-height:1.3;color:#fff7df;font-family:Georgia,'Times New Roman',serif;">${englishTitle}</h2>
                <p style="margin:0 0 12px;color:#9de4ee;font-size:13px;font-weight:700;">${englishEyebrow}</p>
                ${englishBody}
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:18px 26px 22px;">
                <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#e7c34b;color:#07111f;text-decoration:none;border-radius:999px;padding:13px 24px;font-weight:800;letter-spacing:.08em;">${button} / ${englishButton}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 26px 26px;color:#b8c1cc;font-size:13px;">
                <p style="margin:0 0 8px;">若按鈕無法開啟，請複製以下連結到瀏覽器：</p>
                <p style="margin:0 0 8px;">If the button does not open, copy this link into your browser:</p>
                <p style="margin:0;word-break:break-all;color:#9de4ee;">{{ .ConfirmationURL }}</p>
                <p style="margin:18px 0 0;color:#8793a0;">若你沒有申請 MELE 帳號，可以直接忽略這封信。</p>
                <p style="margin:6px 0 0;color:#8793a0;">If you did not request this MELE email, you can safely ignore it.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

const confirmationTemplate = mailTemplate({
  title: '確認你的 MELE 帳號',
  eyebrow: '帳號驗證信',
  body: '<p style="margin:0 0 12px;">歡迎來到 MELE。請點下方按鈕完成 Email 驗證，之後即可保存解讀、領取點數，並使用會員功能。</p><p style="margin:0;">這封信由系統自動寄出，驗證連結有時效限制。</p>',
  button: '確認帳號',
  fallback: '請開啟信件並點擊確認帳號按鈕完成 MELE 註冊。',
  englishTitle: 'Confirm your MELE account',
  englishEyebrow: 'Account confirmation email',
  englishBody: '<p style="margin:0 0 12px;">Welcome to MELE. Please select the button below to confirm your email address. After confirmation, you can save readings, claim points, and use member features.</p><p style="margin:0;">This message was sent automatically, and the confirmation link expires after a limited time.</p>',
  englishButton: 'Confirm account',
  englishFallback: 'Open this email and select the confirmation button to finish creating your MELE account.',
});

const recoveryTemplate = mailTemplate({
  title: '重設你的 MELE 密碼',
  eyebrow: '密碼重設信',
  body: '<p style="margin:0 0 12px;">我們收到你的密碼重設申請。請點下方按鈕回到 MELE 設定新密碼。</p><p style="margin:0;">若不是你本人提出申請，請忽略這封信。</p>',
  button: '重設密碼',
  fallback: '請開啟信件並點擊重設密碼按鈕。',
  englishTitle: 'Reset your MELE password',
  englishEyebrow: 'Password recovery email',
  englishBody: '<p style="margin:0 0 12px;">We received a request to reset your password. Please select the button below to return to MELE and set a new password.</p><p style="margin:0;">If you did not request this, you can safely ignore this email.</p>',
  englishButton: 'Reset password',
  englishFallback: 'Open this email and select the reset password button.',
});

const magicLinkTemplate = mailTemplate({
  title: '登入 MELE',
  eyebrow: '安全登入連結',
  body: '<p style="margin:0 0 12px;">請點下方按鈕登入 MELE。若你沒有要求登入，可以直接忽略這封信。</p>',
  button: '登入 MELE',
  fallback: '請開啟信件並點擊登入 MELE 按鈕。',
  englishTitle: 'Log in to MELE',
  englishEyebrow: 'Secure sign-in link',
  englishBody: '<p style="margin:0 0 12px;">Please select the button below to log in to MELE. If you did not request this sign-in link, you can safely ignore this email.</p>',
  englishButton: 'Log in to MELE',
  englishFallback: 'Open this email and select the log in button.',
});

const projectRef = required('SUPABASE_PROJECT_REF or NEXT_PUBLIC_SUPABASE_URL', deriveProjectRef());
const accessToken = required('SUPABASE_ACCESS_TOKEN', env.SUPABASE_ACCESS_TOKEN);
const siteUrl = normalizeUrl(
  env.MELE_AUTH_SITE_URL
    || (env.NEXT_PUBLIC_SITE_URL && !isLocalUrl(env.NEXT_PUBLIC_SITE_URL) ? env.NEXT_PUBLIC_SITE_URL : '')
    || 'https://mele-chi.vercel.app',
);

const defaultRedirects = [
  `${siteUrl}/**`,
  'http://localhost:3000/**',
  'http://127.0.0.1:3006/**',
];
const redirectUrls = (env.MELE_EXTRA_REDIRECT_URLS || defaultRedirects.join(','))
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const smtpAdminEmail = statusOnly ? env.MELE_SMTP_ADMIN_EMAIL : required('MELE_SMTP_ADMIN_EMAIL', env.MELE_SMTP_ADMIN_EMAIL);
const smtpPass = statusOnly ? '' : required('MELE_SMTP_PASS', env.MELE_SMTP_PASS);

if (process.exitCode) {
  usage();
  process.exit();
}

const authConfig = {
  site_url: siteUrl,
  uri_allow_list: redirectUrls.join(','),
  disable_signup: false,
  external_email_enabled: true,
  mailer_autoconfirm: false,
  smtp_admin_email: smtpAdminEmail,
  smtp_host: env.MELE_SMTP_HOST || 'smtp.resend.com',
  smtp_port: String(env.MELE_SMTP_PORT || '465'),
  smtp_user: env.MELE_SMTP_USER || 'resend',
  smtp_pass: smtpPass,
  smtp_sender_name: env.MELE_SMTP_SENDER_NAME || 'MELE',
  smtp_max_frequency: Number(env.MELE_SMTP_MAX_FREQUENCY || 60),
  mailer_subjects_confirmation: env.MELE_MAIL_SUBJECT_CONFIRMATION || '確認你的 MELE 帳號 / Confirm your MELE account',
  mailer_subjects_recovery: env.MELE_MAIL_SUBJECT_RECOVERY || '重設你的 MELE 密碼 / Reset your MELE password',
  mailer_subjects_magic_link: env.MELE_MAIL_SUBJECT_MAGIC_LINK || '登入 MELE / Log in to MELE',
  mailer_templates_confirmation_content: env.MELE_MAIL_TEMPLATE_CONFIRMATION || confirmationTemplate,
  mailer_templates_recovery_content: env.MELE_MAIL_TEMPLATE_RECOVERY || recoveryTemplate,
  mailer_templates_magic_link_content: env.MELE_MAIL_TEMPLATE_MAGIC_LINK || magicLinkTemplate,
};

const managementUrl = `https://api.supabase.com/v1/projects/${projectRef}/config/auth`;

async function managementRequest(method, body) {
  const response = await fetch(managementUrl, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(`Supabase Management API ${method} failed: HTTP ${response.status} ${JSON.stringify(data)}`);
  }

  return data;
}

function printSafeStatus(data) {
  const picked = {
    site_url: data?.site_url,
    uri_allow_list: data?.uri_allow_list,
    disable_signup: data?.disable_signup,
    external_email_enabled: data?.external_email_enabled,
    mailer_autoconfirm: data?.mailer_autoconfirm,
    smtp_admin_email: data?.smtp_admin_email,
    smtp_host: data?.smtp_host,
    smtp_port: data?.smtp_port,
    smtp_user: data?.smtp_user ? mask(data.smtp_user) : data?.smtp_user,
    smtp_sender_name: data?.smtp_sender_name,
    smtp_max_frequency: data?.smtp_max_frequency,
    mailer_subjects_confirmation: data?.mailer_subjects_confirmation,
    mailer_templates_confirmation_content_chars: data?.mailer_templates_confirmation_content?.length ?? null,
    mailer_templates_recovery_content_chars: data?.mailer_templates_recovery_content?.length ?? null,
    mailer_templates_magic_link_content_chars: data?.mailer_templates_magic_link_content?.length ?? null,
  };
  console.log(JSON.stringify(picked, null, 2));
}

info(`Project ref: ${projectRef}`);
info(`Auth site URL: ${siteUrl}`);
info(`Redirect allow list: ${redirectUrls.join(', ')}`);
info(`SMTP host: ${authConfig.smtp_host}:${authConfig.smtp_port}`);
info(`SMTP sender: ${smtpAdminEmail} (${authConfig.smtp_sender_name})`);

if (statusOnly) {
  const status = await managementRequest('GET');
  printSafeStatus(status);
} else if (!apply) {
  info('Dry run only. No remote settings were changed. Add --apply to update Supabase Auth.');
  console.log(JSON.stringify(redactConfig(authConfig), null, 2));
} else {
  await managementRequest('PATCH', authConfig);
  ok('Supabase Auth config updated.');

  const updated = await managementRequest('GET');
  printSafeStatus(updated);
}
