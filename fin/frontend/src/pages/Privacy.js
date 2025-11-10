import React from 'react';

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4 text-gray-700">Last updated: October 28, 2025</p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Introduction</h2>
        <p className="text-gray-700">This Privacy Policy describes how FixItNow collects, uses, and discloses personal information when you use our service marketplace. We take your privacy seriously and only use information to provide and improve our services.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Information We Collect</h2>
        <p className="text-gray-700">We collect information you provide directly (name, email, profile, service listings), transactional information (bookings, payments), and usage data (pages visited, search queries). We may also collect location data when you use map-based features.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">How We Use Information</h2>
        <p className="text-gray-700">We use collected information to: operate and improve the platform, process bookings and payments, communicate with users, provide customer support, enforce our terms, and for security and fraud prevention.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Sharing & Third Parties</h2>
        <p className="text-gray-700">We share information with service providers to fulfill bookings, with payment processors for transactions, and with analytics providers to improve the product. We do not sell personal data to third parties.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Your Choices</h2>
        <p className="text-gray-700">You can review and update your profile information, opt out of marketing communications, and request deletion of your account. Requests can be sent to info@fixitnow.com.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
        <p className="text-gray-700">If you have questions about this privacy policy, contact us at info@fixitnow.com.</p>
      </section>
    </div>
  );
};

export default Privacy;
