export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 prose">
      <h1>Terms of Service</h1>
      <p><em>Last updated: {new Date().getFullYear()}</em></p>
      <p>By using ClawHost, you agree to use the service lawfully and in accordance with these terms. We reserve the right to suspend accounts that violate these terms.</p>
      <h2>Use of Service</h2>
      <p>ClawHost provides AI-powered workspace tools for business use. You are responsible for content you create. Do not use the service for illegal purposes.</p>
      <h2>Subscription and Billing</h2>
      <p>Subscriptions are billed monthly via Stripe. Cancellation takes effect at the end of the billing period. No refunds for partial months.</p>
      <h2>Data</h2>
      <p>Your workspace data is stored securely. We do not sell your data. See our Privacy Policy for details.</p>
      <h2>Limitation of Liability</h2>
      <p>ClawHost is provided as-is. We are not liable for data loss or business interruption.</p>
      <h2>Contact</h2>
      <p>Questions? Email us at support@clawhost.com.</p>
    </div>
  )
}
