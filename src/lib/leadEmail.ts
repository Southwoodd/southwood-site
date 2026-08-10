/**
 * HTML-шаблон письма Southwood для кабинета Web3Forms
 * (Email Templates → Custom HTML на Pro, либо вставка в свой шаблон).
 * Переменные совпадают с именами полей формы.
 */
export function buildLeadEmailTemplate() {
  return `<!DOCTYPE html>
<html lang="ru">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#070707;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#070707;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;border:1px solid rgba(234,255,0,0.4);background:#0c0c0a;">
          <tr>
            <td style="height:4px;background:#eaff00;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px 24px 8px;">
              <div style="font-family:ui-monospace,monospace;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(234,255,0,0.55);">
                / Southwood · southwood.pw
              </div>
              <h1 style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:1.1;letter-spacing:-0.02em;text-transform:uppercase;color:#eaff00;">
                Новая заявка
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 24px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid rgba(234,255,0,0.2);">
                ${templateRow('Имя')}
                ${templateRow('Компания')}
                ${templateRow('Telegram или телефон')}
                ${templateRow('О чем речь')}
                ${templateRow('Кратко о задаче')}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 28px;font-family:ui-monospace,monospace;font-size:12px;line-height:1.5;color:rgba(234,255,0,0.45);">
              Ответить по контакту из заявки · im@southwood.pw
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function templateRow(label: string) {
  return `
<tr>
  <td style="padding:14px 16px;border-bottom:1px solid rgba(234,255,0,0.2);font-family:ui-monospace,monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(234,255,0,0.55);width:38%;vertical-align:top;">
    ${label}
  </td>
  <td style="padding:14px 16px;border-bottom:1px solid rgba(234,255,0,0.2);font-family:ui-monospace,monospace;font-size:15px;line-height:1.5;color:#eaff00;vertical-align:top;">
    {{${label}}}
  </td>
</tr>`;
}

/** Готовое HTML-письмо с уже подставленными значениями (для API, если доступен HTML-body). */
export function buildLeadEmailHtml(data: {
  name: string;
  company: string;
  contact: string;
  topic: string;
  message: string;
  submittedAt: string;
}) {
  const rows = [
    ['Имя', data.name],
    ['Компания', data.company],
    ['Telegram или телефон', data.contact],
    ['О чем речь', data.topic],
    ['Кратко о задаче', data.message || '—'],
  ];

  const rowHtml = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:14px 16px;border-bottom:1px solid rgba(234,255,0,0.2);font-family:ui-monospace,monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(234,255,0,0.55);width:38%;vertical-align:top;">
          ${escapeHtml(label)}
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid rgba(234,255,0,0.2);font-family:ui-monospace,monospace;font-size:15px;line-height:1.5;color:#eaff00;vertical-align:top;">
          ${escapeHtml(value).replace(/\n/g, '<br/>')}
        </td>
      </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="ru">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#070707;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#070707;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;border:1px solid rgba(234,255,0,0.4);background:#0c0c0a;">
          <tr>
            <td style="height:4px;background:#eaff00;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px 24px 8px;">
              <div style="font-family:ui-monospace,monospace;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(234,255,0,0.55);">
                / Southwood · southwood.pw
              </div>
              <h1 style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:1.1;letter-spacing:-0.02em;text-transform:uppercase;color:#eaff00;">
                Новая заявка
              </h1>
              <p style="margin:10px 0 0;font-family:ui-monospace,monospace;font-size:12px;color:rgba(234,255,0,0.55);">
                ${escapeHtml(data.submittedAt)}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 24px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid rgba(234,255,0,0.2);">
                ${rowHtml}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 28px;font-family:ui-monospace,monospace;font-size:12px;line-height:1.5;color:rgba(234,255,0,0.45);">
              Ответить по контакту из заявки · im@southwood.pw
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
