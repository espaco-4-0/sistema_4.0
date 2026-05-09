import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "localhost",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER ?? "",
        pass: process.env.SMTP_PASS ?? "",
    },
});

const FROM = process.env.SMTP_FROM ?? "Espaço 4.0 <noreply@espaco40.ifal.edu.br>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function baseLayout(content: string): string {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Espaço 4.0</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#1a1a1a;padding:24px 32px;text-align:center;">
            <span style="color:#f5c518;font-size:22px;font-weight:bold;letter-spacing:1px;">ESPAÇO 4.0</span>
            <span style="color:#9ca3af;font-size:13px;display:block;margin-top:4px;">IFAL — Instituto Federal de Alagoas</span>
          </td>
        </tr>

        <!-- Content -->
        <tr><td style="padding:32px;">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
            <span style="color:#9ca3af;font-size:12px;">
              Este é um e-mail automático. Não responda diretamente.<br/>
              Espaço 4.0 — IFAL | <a href="${APP_URL}" style="color:#f5c518;text-decoration:none;">${APP_URL}</a>
            </span>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function infoRow(label: string, value: string): string {
    return `<tr>
      <td style="padding:6px 0;color:#6b7280;font-size:13px;width:140px;">${label}</td>
      <td style="padding:6px 0;color:#111827;font-size:13px;font-weight:600;">${value}</td>
    </tr>`;
}

function primaryButton(text: string, href: string): string {
    return `<a href="${href}" style="display:inline-block;background:#f5c518;color:#1a1a1a;font-weight:bold;font-size:14px;padding:12px 28px;border-radius:6px;text-decoration:none;margin-top:20px;">${text}</a>`;
}

export interface VisitRequestData {
    instituicao: string;
    responsavel: string;
    email: string;
    quantidade: number;
    data: string; // "dd/MM/yyyy"
    horaInicio: string;
    horaFim: string;
    mensagem?: string;
}

export async function sendRequestConfirmationToApplicant(data: VisitRequestData): Promise<void> {
    const html = baseLayout(`
      <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">Solicitação recebida! ✅</h2>
      <p style="color:#4b5563;font-size:14px;margin:0 0 24px;">
        Olá, <strong>${data.responsavel}</strong>! Sua solicitação de visita ao <strong>Espaço 4.0</strong>
        foi recebida com sucesso e está sendo analisada pela nossa equipe.
      </p>

      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:bold;color:#374151;text-transform:uppercase;letter-spacing:0.05em;">
          Resumo da solicitação
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoRow("Instituição", data.instituicao)}
          ${infoRow("Responsável", data.responsavel)}
          ${infoRow("Data", data.data)}
          ${infoRow("Horário", `${data.horaInicio} – ${data.horaFim}`)}
          ${infoRow("Participantes", `${data.quantidade} pessoa(s)`)}
          ${data.mensagem ? infoRow("Objetivo", data.mensagem) : ""}
        </table>
      </div>

      <p style="color:#4b5563;font-size:14px;margin:0 0 8px;">
        <strong>Próximos passos:</strong>
      </p>
      <ol style="color:#4b5563;font-size:14px;padding-left:20px;line-height:1.8;">
        <li>Nossa equipe irá confirmar o recebimento por e-mail.</li>
        <li>A documentação enviada será analisada.</li>
        <li>Você receberá uma resposta com a decisão final.</li>
      </ol>

      <p style="color:#6b7280;font-size:13px;margin-top:24px;">
        Dúvidas? Responda este e-mail ou acesse nosso portal.
      </p>
    `);

    await transporter.sendMail({
        from: FROM,
        to: data.email,
        subject: "✅ Solicitação de visita recebida — Espaço 4.0",
        html,
    });
}

export async function sendNewRequestNotificationToAdmin(data: VisitRequestData & { visitId: number }): Promise<void> {
    if (!ADMIN_EMAIL) return;

    const adminUrl = `${APP_URL}/professor/agenda`;

    const html = baseLayout(`
      <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">Nova solicitação de visita 🔔</h2>
      <p style="color:#4b5563;font-size:14px;margin:0 0 24px;">
        Uma nova solicitação foi enviada pelo portal e aguarda sua análise.
      </p>

      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:bold;color:#374151;text-transform:uppercase;letter-spacing:0.05em;">
          Dados da solicitação #${data.visitId}
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoRow("Instituição", data.instituicao)}
          ${infoRow("Responsável", data.responsavel)}
          ${infoRow("E-mail", data.email)}
          ${infoRow("Data", data.data)}
          ${infoRow("Horário", `${data.horaInicio} – ${data.horaFim}`)}
          ${infoRow("Participantes", `${data.quantidade} pessoa(s)`)}
          ${data.mensagem ? infoRow("Objetivo", data.mensagem) : ""}
        </table>
      </div>

      <p style="color:#4b5563;font-size:14px;">
        Acesse o painel administrativo para analisar a documentação e avançar no processo.
      </p>

      ${primaryButton("Abrir Painel de Visitas", adminUrl)}
    `);

    await transporter.sendMail({
        from: FROM,
        to: ADMIN_EMAIL,
        subject: `🔔 Nova solicitação de visita — ${data.instituicao} (#${data.visitId})`,
        html,
    });
}

export async function sendApprovalEmail(
    to: string,
    responsavel: string,
    data: string,
    horaInicio: string,
    horaFim: string,
    instituicao: string
): Promise<void> {
    const html = baseLayout(`
      <h2 style="margin:0 0 8px;color:#16a34a;font-size:20px;">Visita aprovada! 🎉</h2>
      <p style="color:#4b5563;font-size:14px;margin:0 0 24px;">
        Parabéns, <strong>${responsavel}</strong>! Sua solicitação de visita foi
        <strong style="color:#16a34a;">aprovada</strong> pelo IFAL.
      </p>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:bold;color:#15803d;text-transform:uppercase;letter-spacing:0.05em;">
          Visita confirmada
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoRow("Instituição", instituicao)}
          ${infoRow("Data", data)}
          ${infoRow("Horário", `${horaInicio} – ${horaFim}`)}
          ${infoRow("Local", "Espaço 4.0 — IFAL")}
        </table>
      </div>

      <p style="color:#4b5563;font-size:14px;">
        Por favor, chegue com <strong>15 minutos de antecedência</strong>. Apresente este e-mail
        na recepção junto com documento de identificação do responsável.
      </p>
    `);

    await transporter.sendMail({
        from: FROM,
        to,
        subject: "🎉 Sua visita ao Espaço 4.0 foi aprovada!",
        html,
    });
}

export async function sendDenialEmail(
    to: string,
    responsavel: string,
    instituicao: string,
    motivo: string
): Promise<void> {
    const html = baseLayout(`
      <h2 style="margin:0 0 8px;color:#dc2626;font-size:20px;">Atualização sobre sua visita</h2>
      <p style="color:#4b5563;font-size:14px;margin:0 0 24px;">
        Olá, <strong>${responsavel}</strong>. Infelizmente, sua solicitação de visita da
        <strong>${instituicao}</strong> ao Espaço 4.0 <strong style="color:#dc2626;">não foi aprovada</strong>.
      </p>

      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:bold;color:#991b1b;">Motivo informado:</p>
        <p style="margin:0;color:#7f1d1d;font-size:14px;">${motivo}</p>
      </div>

      <p style="color:#4b5563;font-size:14px;">
        Caso queira solicitar uma nova visita para outra data ou com ajustes na documentação,
        acesse o portal e faça uma nova solicitação.
      </p>

      <p style="color:#6b7280;font-size:13px;margin-top:20px;">
        Agradecemos seu interesse no Espaço 4.0.
      </p>
    `);

    await transporter.sendMail({
        from: FROM,
        to,
        subject: "⚠️ Atualização sobre sua solicitação de visita — Espaço 4.0",
        html,
    });
}

export async function sendEmailReceivedConfirmation(
    to: string,
    responsavel: string,
    instituicao: string
): Promise<void> {
    const html = baseLayout(`
      <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">E-mail recebido pela equipe 📬</h2>
      <p style="color:#4b5563;font-size:14px;margin:0 0 24px;">
        Olá, <strong>${responsavel}</strong>! Confirmamos que o e-mail referente à visita da
        <strong>${instituicao}</strong> foi recebido pela nossa equipe.
      </p>
      <p style="color:#4b5563;font-size:14px;">
        O próximo passo é a análise da documentação enviada. Você receberá um novo
        e-mail assim que houver uma atualização no processo.
      </p>
    `);

    await transporter.sendMail({
        from: FROM,
        to,
        subject: "📬 E-mail recebido — Espaço 4.0",
        html,
    });
}

export async function sendResetPasswordEmail(to: string, nome: string, resetLink: string): Promise<void> {
    const html = baseLayout(`
      <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">Recuperação de Senha 🔓</h2>
      <p style="color:#4b5563;font-size:14px;margin:0 0 24px;">
        Olá, <strong>${nome}</strong>! Confirmamos que você deseja redefinir a senha da sua conta.
      </p>
      <p style="color:#4b5563;font-size:14px;">
        Clique no botão abaixo para criar uma nova senha. Este link é válido por tempo limitado.
      </p>

      ${primaryButton("Redefinir minha senha", resetLink)}

      <p style="color:#6b7280;font-size:13px;margin-top:24px;">
        Se você não solicitou a redefinição de senha, ignore este e-mail. Sua senha permanecerá a mesma.
      </p>
    `);

    await transporter.sendMail({
        from: FROM,
        to,
        subject: "🔓 Redefinição de senha — Espaço 4.0",
        html,
    });
}
