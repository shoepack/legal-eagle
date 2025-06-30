import Link from "next/link";

export default function Pricing() {
  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-heading font-bold text-navy mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-gray max-w-3xl mx-auto">
            Choose the plan that&apos;s right for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-8">
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-navy mb-2">
                  Standard
                </h3>
                <p className="text-slate-gray mb-6">
                  For individuals and small teams
                </p>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-teal">$49</span>
                  <span className="text-slate-gray ml-2">/ month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <span className="text-slate-gray">Up to 10 users</span>
                </li>
                <li className="flex items-center">
                  <span className="text-slate-gray">
                    Intelligent document processing
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="text-slate-gray">
                    Seamless collaboration
                  </span>
                </li>
              </ul>

              <div className="text-center">
                <Link
                  href="/login"
                  className="w-full bg-teal text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-opacity-90 transition-colors inline-block"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-8">
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-navy mb-2">
                  Enterprise
                </h3>
                <p className="text-slate-gray mb-6">For large organizations</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-teal">Contact</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <span className="text-slate-gray">Unlimited users</span>
                </li>
                <li className="flex items-center">
                  <span className="text-slate-gray">Dedicated support</span>
                </li>
                <li className="flex items-center">
                  <span className="text-slate-gray">Custom integrations</span>
                </li>
              </ul>

              <div className="text-center">
                <Link
                  href="/login"
                  className="w-full bg-teal text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-opacity-90 transition-colors inline-block"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
