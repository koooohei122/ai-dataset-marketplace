import nodemailer from "nodemailer"

// メール送信設定（環境変数から取得）
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  // メール設定がない場合はスキップ（開発環境）
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.log("Email not configured. Would send:", { to, subject })
    return { success: false, message: "Email not configured" }
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    })

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Email send error:", error)
    return { success: false, error }
  }
}

export async function sendPurchaseConfirmationEmail(
  email: string,
  datasetTitle: string,
  purchaseId: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>購入が完了しました</h2>
      <p>以下のデータセットの購入が完了しました：</p>
      <ul>
        <li><strong>データセット:</strong> ${datasetTitle}</li>
        <li><strong>購入ID:</strong> ${purchaseId}</li>
      </ul>
      <p>ダウンロードは購入後30日間、最大5回まで可能です。</p>
      <p><a href="${process.env.NEXTAUTH_URL}/purchases">購入履歴を確認</a></p>
    </div>
  `

  return sendEmail({
    to: email,
    subject: `[AI Dataset Marketplace] 購入完了: ${datasetTitle}`,
    html,
  })
}

export async function sendReviewNotificationEmail(
  sellerEmail: string,
  datasetTitle: string,
  reviewerName: string,
  rating: number
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>新しいレビューが投稿されました</h2>
      <p>あなたのデータセット「${datasetTitle}」に新しいレビューが投稿されました：</p>
      <ul>
        <li><strong>レビュアー:</strong> ${reviewerName}</li>
        <li><strong>評価:</strong> ${rating}/5 ⭐</li>
      </ul>
      <p><a href="${process.env.NEXTAUTH_URL}/dashboard">ダッシュボードで確認</a></p>
    </div>
  `

  return sendEmail({
    to: sellerEmail,
    subject: `[AI Dataset Marketplace] 新しいレビュー: ${datasetTitle}`,
    html,
  })
}

export async function sendPurchaseRequestEmail(
  sellerEmail: string,
  buyerName: string,
  datasetTitle: string,
  amount: number,
  purchaseId: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>購入リクエストが届きました</h2>
      <p>以下のデータセットの購入リクエストが届きました：</p>
      <ul>
        <li><strong>データセット:</strong> ${datasetTitle}</li>
        <li><strong>購入者:</strong> ${buyerName}</li>
        <li><strong>金額:</strong> ¥${amount.toLocaleString()}</li>
        <li><strong>購入ID:</strong> ${purchaseId}</li>
      </ul>
      <p>決済を完了して、購入を承認してください。</p>
      <p><a href="${process.env.NEXTAUTH_URL}/dashboard">ダッシュボードで確認</a></p>
    </div>
  `

  return sendEmail({
    to: sellerEmail,
    subject: `[AI Dataset Marketplace] 購入リクエスト: ${datasetTitle}`,
    html,
  })
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>パスワードリセットのご案内</h2>
      <p>${name} さん、</p>
      <p>パスワードリセットのリクエストを受け付けました。以下のボタンをクリックして新しいパスワードを設定してください。</p>
      <p style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}"
           style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          パスワードをリセット
        </a>
      </p>
      <p style="color: #6b7280; font-size: 14px;">このリンクは60分間有効です。</p>
      <p style="color: #6b7280; font-size: 14px;">心当たりがない場合はこのメールを無視してください。パスワードは変更されません。</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 12px;">AI Dataset Marketplace</p>
    </div>
  `

  return sendEmail({
    to: email,
    subject: "[AI Dataset Marketplace] パスワードリセット",
    html,
  })
}

