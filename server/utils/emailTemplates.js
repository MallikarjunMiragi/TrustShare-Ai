const brandStyles = {
  fontFamily: "'Plus Jakarta Sans', Arial, sans-serif",
  bg: '#F8FAFC',
  card: 'rgba(255,255,255,0.9)',
  primary: '#7C3AED',
  text: '#0F172A',
  muted: '#64748B',
};

const layout = (title, bodyHtml) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0;background:${brandStyles.bg};font-family:${brandStyles.fontFamily};color:${brandStyles.text};">
    <div style="padding:32px 16px;">
      <div style="max-width:600px;margin:0 auto;background:${brandStyles.card};border-radius:20px;padding:28px;border:1px solid rgba(148,163,184,0.25);box-shadow:0 20px 50px rgba(15,23,42,0.08);">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
          <div style="height:44px;width:44px;border-radius:14px;background:rgba(124,58,237,0.15);display:flex;align-items:center;justify-content:center;color:${brandStyles.primary};font-weight:700;">TS</div>
          <div>
            <p style="margin:0;font-size:14px;letter-spacing:0.08em;color:${brandStyles.muted};text-transform:uppercase;">TrustShareAI</p>
            <h1 style="margin:4px 0 0;font-size:22px;">${title}</h1>
          </div>
        </div>
        ${bodyHtml}
        <div style="margin-top:24px;font-size:12px;color:${brandStyles.muted};">
          <p style="margin:0;">Questions? Reply to this email and we will help you out.</p>
        </div>
      </div>
      <p style="text-align:center;font-size:12px;color:${brandStyles.muted};margin-top:16px;">Shared with care by TrustShareAI</p>
    </div>
  </body>
</html>`;

const approvalTemplate = ({ itemTitle, dueAt, appUrl }) => {
  const dueLine = dueAt ? `<p style="margin:0 0 12px;">Expected return: <strong>${dueAt}</strong></p>` : '';
  const body = `
    <p style="margin:0 0 12px;">Good news! Your borrow request for <strong>${itemTitle}</strong> was approved.</p>
    ${dueLine}
    <a href="${appUrl}" style="display:inline-block;background:${brandStyles.primary};color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:14px;font-weight:600;">Open TrustShareAI</a>
    <div style="margin-top:16px;padding:14px;border-radius:16px;background:#F1F5F9;font-size:13px;color:${brandStyles.muted};">
      Remember to keep the item in great condition and return it on time to boost your trust score.
    </div>
  `;
  return {
    subject: 'Your borrow request was approved',
    html: layout('Request Approved', body),
    text: `Your borrow request for "${itemTitle}" was approved.${dueAt ? ` Expected return: ${dueAt}.` : ''} Open TrustShareAI: ${appUrl}`,
  };
};

const returnTemplate = ({ itemTitle, onTime, appUrl }) => {
  const body = `
    <p style="margin:0 0 12px;">The item <strong>${itemTitle}</strong> was marked as returned.</p>
    <div style="margin:0 0 16px;padding:12px;border-radius:16px;background:${onTime ? '#ECFDF5' : '#FEF2F2'};color:${onTime ? '#065F46' : '#991B1B'};font-size:13px;">
      ${onTime ? 'Returned on time. Thanks for keeping the community trusted.' : 'Marked as late return. Please connect with the owner if needed.'}
    </div>
    <a href="${appUrl}" style="display:inline-block;background:${brandStyles.primary};color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:14px;font-weight:600;">View Request</a>
  `;
  return {
    subject: `Item returned: ${itemTitle}`,
    html: layout('Item Returned', body),
    text: `The item "${itemTitle}" was marked as returned.${onTime ? ' Returned on time.' : ' Marked as late return.'} View details: ${appUrl}`,
  };
};

module.exports = { approvalTemplate, returnTemplate };
