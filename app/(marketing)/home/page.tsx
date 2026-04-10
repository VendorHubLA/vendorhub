import Link from 'next/link'
import Image from 'next/image'
import {
  FolderKanban, Users, ShieldCheck, BarChart3,
  MessageSquare, Sparkles, ArrowRight, CheckCircle2,
  Zap,
} from 'lucide-react'

export const metadata = {
  title: 'VendorHub — Where Vendors, Communication, and Projects Align',
  description: 'The AI-native operating system for commercial real estate vendor management.',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Nav */}
      <nav className="relative flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
        {/* Left: logo */}
        <div className="flex items-center">
          <Image
            src="/logo-full.png"
            alt="VendorHub"
            width={160}
            height={58}
            className="h-10 w-auto"
            priority
          />
        </div>

        {/* Center: nav links */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
          <a href="#features" className="text-sm text-gray-600 hover:text-[#1E3829] transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-gray-600 hover:text-[#1E3829] transition-colors">How It Works</a>
          <a href="#pricing" className="text-sm text-gray-600 hover:text-[#1E3829] transition-colors">Pricing</a>
        </div>

        {/* Right: CTA */}
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-[#1E3829] hover:text-[#2E5A40] transition-colors">
            Sign in
          </Link>
          <a href="#contact"
            className="rounded-md bg-[#1E3829] px-4 py-2 text-sm font-semibold text-[#C4A35A] hover:bg-[#2E5A40] transition-colors">
            Request Access
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo-full.png"
            alt="VendorHub — Where Vendors, Communication, and Projects Align"
            width={680}
            height={246}
            className="w-full max-w-xl md:max-w-2xl h-auto"
            priority
          />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-[#C4A35A]/30 bg-[#C4A35A]/10 px-4 py-1.5 mb-10">
          <Sparkles className="h-3.5 w-3.5 text-[#C4A35A]" />
          <span className="text-xs font-medium text-[#A8893E]">AI-Native Vendor Management</span>
        </div>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          VendorHub is the operating system for commercial real estate teams — connecting vetted vendors,
          centralizing communication, and anticipating project needs before they become problems.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#contact"
            className="flex items-center justify-center gap-2 rounded-md bg-[#1E3829] px-6 py-3 text-sm font-semibold text-[#C4A35A] hover:bg-[#2E5A40] transition-colors">
            Request Early Access
            <ArrowRight className="h-4 w-4" />
          </a>
          <Link href="/login"
            className="flex items-center justify-center rounded-md border border-[#1E3829] px-6 py-3 text-sm font-semibold text-[#1E3829] hover:bg-[#EDE6D8] transition-colors">
            Sign In
          </Link>
        </div>
      </section>

      {/* Platform preview strip */}
      <section className="bg-[#1E3829] py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-6 text-[#C4A35A] text-sm font-medium">
          {['Vetted Vendor Registry', 'AI Copilot (⌘K)', 'Real-Time Project Threads', 'Compliance Tracking', 'Milestone Payments', 'Portfolio Analytics', 'RFP Generation'].map((item, i) => (
            <span key={i} className="whitespace-nowrap flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-[#C4A35A]/50 shrink-0" />
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E3829] mb-4">
            Built for How CRE Teams Actually Operate
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Time is limited. Expectations are high. Execution matters. VendorHub is designed around those realities.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={Users}
            title="Vendor Performance Registry"
            description="Dynamic scoring across response time, budget adherence, quality, and completion rate. Know exactly who to call before the project starts."
            gold
          />
          <FeatureCard
            icon={FolderKanban}
            title="Project Command Center"
            description="One workspace per project. Milestones, budget tracking, vendor assignment, and punch lists — all in one place for every stakeholder."
          />
          <FeatureCard
            icon={MessageSquare}
            title="Centralized Communication"
            description="Real-time project threads replace fragmented email chains. Everyone — owner, PM, vendor — in the same conversation."
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Compliance Engine"
            description="Auto-track COIs, licenses, W-9s, and bonds. 30/60/90-day expiry alerts. No more chasing paperwork or flying blind."
          />
          <FeatureCard
            icon={Sparkles}
            title="AI Copilot"
            description="Draft RFPs, get instant project status answers, and surface compliance risks — all through a natural language interface triggered with ⌘K."
            gold
          />
          <FeatureCard
            icon={BarChart3}
            title="Portfolio Intelligence"
            description="Asset manager view across all properties: spend analytics, vendor utilization, CapEx forecasting, and risk scoring in one dashboard."
          />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-[#1E3829] py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#F5F0E8] mb-4">How VendorHub Works</h2>
            <p className="text-[#9CA3AF] max-w-xl mx-auto">Three steps to a fully structured vendor operation.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '01', title: 'Build Your Registry', body: 'Invite vendors, track their compliance documents, and let the platform build dynamic performance scores over time.' },
              { step: '02', title: 'Launch Projects', body: 'Create projects, assign vendors, set milestones, and get the AI to draft your RFP — all in under five minutes.' },
              { step: '03', title: 'Stay Ahead', body: 'Real-time threads, compliance alerts, and AI-powered insights keep you informed before anything becomes a problem.' },
            ].map(({ step, title, body }) => (
              <div key={step} className="relative">
                <span className="text-6xl font-bold text-[#2E5A40] leading-none">{step}</span>
                <h3 className="text-lg font-bold text-[#F5F0E8] mt-2 mb-2">{title}</h3>
                <p className="text-[#9CA3AF] text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E3829] mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-600">Start with what you need. Scale as your portfolio grows.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          <PricingCard
            tier="Starter"
            price="$297"
            period="/month"
            description="For single PMs managing up to 5 properties."
            features={['5 properties', '1 PM seat', 'Vendor registry', 'Compliance tracking', 'Project threads']}
          />
          <PricingCard
            tier="Professional"
            price="$797"
            period="/month"
            description="For growing teams managing up to 25 properties."
            features={['25 properties', '5 PM seats', 'Everything in Starter', 'AI Copilot + RFP drafting', 'Portfolio analytics', 'Priority support']}
            highlighted
          />
          <PricingCard
            tier="Enterprise"
            price="Custom"
            period=""
            description="For institutional owners and large management firms."
            features={['Unlimited properties', 'Unlimited seats', 'Everything in Pro', 'Yardi / MRI integration', 'White-label option', 'Dedicated account manager']}
          />
        </div>
        <p className="text-center text-sm text-gray-500 mt-8">
          Vendor seats available at $49/month. All plans include a 90-day founding client trial.
        </p>
      </section>

      {/* Contact / CTA */}
      <section id="contact" className="bg-[#1E3829] py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#F5F0E8] mb-4">
            Ready to Bring Structure to Your Vendor Operation?
          </h2>
          <p className="text-[#9CA3AF] mb-10">
            We're onboarding founding property management firms now. No commitment required.
          </p>
          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#EDE6D8] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Image src="/logo-full.png" alt="VendorHub" width={120} height={44} className="h-8 w-auto" />
          <p className="text-xs text-gray-400">
            Where Vendors, Communication, and Projects Align
          </p>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} VendorHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon: Icon, title, description, gold,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  gold?: boolean
}) {
  return (
    <div className={`rounded-xl border p-6 ${gold ? 'border-[#C4A35A]/40 bg-[#C4A35A]/5' : 'border-[#D6CCBC] bg-white'}`}>
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-4 ${gold ? 'bg-[#C4A35A]' : 'bg-[#1E3829]'}`}>
        <Icon className={`h-5 w-5 ${gold ? 'text-[#1E3829]' : 'text-[#C4A35A]'}`} />
      </div>
      <h3 className="font-bold text-[#1E3829] mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}

function PricingCard({
  tier, price, period, description, features, highlighted,
}: {
  tier: string; price: string; period: string; description: string; features: string[]; highlighted?: boolean
}) {
  return (
    <div className={`rounded-xl border p-6 flex flex-col ${highlighted ? 'border-[#C4A35A] bg-[#1E3829] shadow-xl scale-105' : 'border-[#D6CCBC] bg-white'}`}>
      <div className="mb-6">
        <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${highlighted ? 'text-[#C4A35A]' : 'text-[#2E5A40]'}`}>{tier}</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-4xl font-bold ${highlighted ? 'text-[#F5F0E8]' : 'text-[#1E3829]'}`}>{price}</span>
          <span className={`text-sm ${highlighted ? 'text-[#9CA3AF]' : 'text-gray-500'}`}>{period}</span>
        </div>
        <p className={`text-sm mt-2 ${highlighted ? 'text-[#9CA3AF]' : 'text-gray-500'}`}>{description}</p>
      </div>
      <ul className="space-y-2.5 flex-1 mb-8">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2.5">
            <CheckCircle2 className={`h-4 w-4 shrink-0 ${highlighted ? 'text-[#C4A35A]' : 'text-[#2E5A40]'}`} />
            <span className={`text-sm ${highlighted ? 'text-[#F5F0E8]' : 'text-gray-700'}`}>{f}</span>
          </li>
        ))}
      </ul>
      <a href="#contact"
        className={`block text-center rounded-md py-2.5 text-sm font-semibold transition-colors ${
          highlighted
            ? 'bg-[#C4A35A] text-[#1E3829] hover:bg-[#D4B87A]'
            : 'border border-[#1E3829] text-[#1E3829] hover:bg-[#F5F0E8]'
        }`}>
        Get Started
      </a>
    </div>
  )
}

function ContactForm() {
  return (
    <form
      action="https://formsubmit.co/hello@vendorhub.io"
      method="POST"
      className="space-y-4 text-left"
    >
      <input type="hidden" name="_captcha" value="false" />
      <input type="hidden" name="_subject" value="VendorHub — New partnership inquiry" />
      <div className="grid grid-cols-2 gap-4">
        <input name="name" required placeholder="Your name"
          className="rounded-md border border-[#2E5A40] bg-[#2E5A40]/30 px-4 py-3 text-sm text-[#F5F0E8] placeholder:text-[#6B7280] outline-none focus:border-[#C4A35A] transition-colors" />
        <input name="company" placeholder="Company"
          className="rounded-md border border-[#2E5A40] bg-[#2E5A40]/30 px-4 py-3 text-sm text-[#F5F0E8] placeholder:text-[#6B7280] outline-none focus:border-[#C4A35A] transition-colors" />
      </div>
      <input name="email" type="email" required placeholder="Email address"
        className="w-full rounded-md border border-[#2E5A40] bg-[#2E5A40]/30 px-4 py-3 text-sm text-[#F5F0E8] placeholder:text-[#6B7280] outline-none focus:border-[#C4A35A] transition-colors" />
      <textarea name="message" rows={3} placeholder="Tell us about your portfolio..."
        className="w-full rounded-md border border-[#2E5A40] bg-[#2E5A40]/30 px-4 py-3 text-sm text-[#F5F0E8] placeholder:text-[#6B7280] outline-none focus:border-[#C4A35A] transition-colors resize-none" />
      <button type="submit"
        className="w-full rounded-md bg-[#C4A35A] py-3 text-sm font-semibold text-[#1E3829] hover:bg-[#D4B87A] transition-colors">
        Request Partnership
      </button>
    </form>
  )
}
