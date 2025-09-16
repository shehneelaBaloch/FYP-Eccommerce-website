export default function ContactPage() {
  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
            <div className="space-y-4 text-gray-600">
              <p>📧 info@shopease.com</p>
              <p>📞 +1 (555) 123-4567</p>
              <p>📍 123 Fashion Street, Style City</p>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Send a Message</h2>
            <form className="space-y-4">
              <input type="text" placeholder="Your Name" className="w-full p-3 border rounded-lg" />
              <input type="email" placeholder="Your Email" className="w-full p-3 border rounded-lg" />
              <textarea placeholder="Your Message" rows={4} className="w-full p-3 border rounded-lg" />
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}