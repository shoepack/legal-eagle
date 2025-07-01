import Link from "next/link";
import CheckIcon from "@/components/CheckIcon";

export default function Pricing() {
  return (
    <main className="min-h-screen bg-white pt-24 sm:pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-heading font-bold text-navy mb-4">
            Find the perfect plan for your team
          </h1>
          <p className="text-xl text-slate-gray max-w-3xl mx-auto">
            Start with a 14-day free trial. No credit card required.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Essential Plan */}
          <div className="flex flex-col">
            <div className="bg-teal text-white text-center text-sm font-bold uppercase tracking-wider py-2 rounded-t-lg">
              Recommended
            </div>
            <div className="relative bg-light-blue rounded-b-lg shadow-lg border-2 border-teal p-6 flex flex-col flex-grow">
              <div className="flex-grow">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-navy mb-2">
                    Essential
                  </h3>
                  <p className="text-slate-gray mb-6">
                    For individuals and small teams
                  </p>
                  <div className="mb-8">
                    <span className="text-5xl font-bold text-teal">$15</span>
                    <span className="text-slate-gray ml-2">/ user / month</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <CheckIcon />
                    <span className="text-slate-gray ml-3">Up to 5 users</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon />
                    <span className="text-slate-gray ml-3">
                      Core document analysis
                    </span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon />
                    <span className="text-slate-gray ml-3">
                      Standard collaboration tools
                    </span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon />
                    <span className="text-slate-gray ml-3">Email support</span>
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <Link
                  href="/login"
                  className="w-full bg-teal text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-opacity-90 transition-transform duration-200 transform hover:scale-105 hover:shadow-lg inline-block"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="flex flex-col">
            <div className="bg-gray-700 text-white text-center text-sm font-bold uppercase tracking-wider py-2 rounded-t-lg">
              Most Flexible
            </div>
            <div className="bg-white rounded-b-lg shadow-lg border-2 border-gray-200 p-6 flex flex-col flex-grow">
              <div className="flex-grow">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-navy mb-2">
                    Enterprise
                  </h3>
                  <p className="text-slate-gray mb-6">
                    For large organizations
                  </p>
                  <div className="mb-8">
                    <span className="text-5xl font-bold text-teal">
                      Contact
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <CheckIcon />
                    <span className="text-slate-gray ml-3">
                      Unlimited users
                    </span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon />
                    <span className="text-slate-gray ml-3">
                      Advanced AI analysis
                    </span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon />
                    <span className="text-slate-gray ml-3">
                      Priority support & dedicated account manager
                    </span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon />
                    <span className="text-slate-gray ml-3">
                      Custom integrations & API access
                    </span>
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <Link
                  href="/login"
                  className="w-full bg-gray-700 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-600 transition-transform duration-200 transform hover:scale-105 hover:shadow-lg inline-block"
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
