export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 prose">
      <h1>Privacy Policy</h1>
      <p><em>Last updated: {new Date().getFullYear()}</em></p>
      <p>Foyer collects only what is necessary to provide the service.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Email address (for account and billing)</li>
        <li>Workspace content you create</li>
        <li>Usage data (credits consumed, session activity)</li>
      </ul>
      <h2>What we do not collect</h2>
      <ul>
        <li>We do not sell your data to third parties.</li>
        <li>We do not use your workspace content to train AI models.</li>
      </ul>
      <h2>Third parties</h2>
      <p>We use Stripe for billing and OpenRouter for AI model access. Their privacy policies apply to data they process.</p>
      <h2>Data retention</h2>
      <p>You may delete your account at any time. Workspace data is deleted within 30 days of account deletion.</p>
      <h2>Contact</h2>
      <p>Privacy questions: privacy@foyer.work</p>
    </div>
  )
}
