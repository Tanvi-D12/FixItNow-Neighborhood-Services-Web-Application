import React from 'react';

const Refund = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Refund Policy</h1>
      <p className="mb-4 text-gray-700">Last updated: October 28, 2025</p>

      <section className="mb-6">
        <p className="text-gray-700">At FixItNow, refunds are handled on a case-by-case basis. If you believe you are eligible for a refund, please contact the site administrator or support team and provide your booking details, reason for the request, and any supporting evidence.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">How to Request a Refund</h2>
        <ol className="list-decimal list-inside text-gray-700">
          <li>Send an email to <strong>info@fixitnow.com</strong> with your booking ID and a brief explanation.</li>
          <li>Include photos or other evidence if applicable.</li>
          <li>Allow up to 7 business days for our team to respond.</li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Contact Admin</h2>
        <p className="text-gray-700">For refund requests, please contact the admin at <strong>info@fixitnow.com</strong> or use the contact form on the site. Refunds are granted at the discretion of the admin and in accordance with provider policies.</p>
      </section>
    </div>
  );
};

export default Refund;
