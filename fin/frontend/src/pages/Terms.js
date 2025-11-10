import React from 'react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-4 text-gray-700">Last updated: October 28, 2025</p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Acceptance of Terms</h2>
        <p className="text-gray-700">By using FixItNow, you agree to these terms. The platform connects customers with independent service providers; FixItNow is not the service provider and is not responsible for the acts or omissions of providers.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Accounts</h2>
        <p className="text-gray-700">Users must provide accurate information and are responsible for activity on their account. You agree not to use the service for unlawful purposes.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Bookings & Payments</h2>
        <p className="text-gray-700">Bookings between customers and providers are subject to each provider's schedule and policies. Payments are processed by third-party processors and are subject to their terms.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Limitation of Liability</h2>
        <p className="text-gray-700">To the extent permitted by law, FixItNow and its affiliates are not liable for direct or indirect damages arising from your use of the service.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Contact</h2>
        <p className="text-gray-700">For questions about these terms, contact support at info@fixitnow.com.</p>
      </section>
    </div>
  );
};

export default Terms;
