'use client'

const ContactPage = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-black text-black">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center mb-6">Contact Us</h2>
        <p className="text-center">
          <span className="font-semibold">Email:</span> info@example.com
        </p>
        <p className="text-center">
          <span className="font-semibold">Phone:</span> 555-555-5555
        </p>
        <p className="text-center">
          <span className="font-semibold">Address:</span> 123 Main St, Anytown, USA 12345
        </p>
      </div>
    </div>
  )
}

export default ContactPage

