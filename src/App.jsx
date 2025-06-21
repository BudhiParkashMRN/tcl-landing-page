import React, { useState, useEffect, useRef } from 'react';
// Changed import: Removed 'Cricket' as it's not directly available in Lucide.
// Will use a custom SVG for the cricket icon.
import { Trophy, Tv, Send, CheckCircle, Download, Twitter, Facebook, Instagram } from 'lucide-react';

// Main App component
const App = () => {
  // State variables for form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('');
  const [selectedState, setSelectedState] = useState('');

  // State variables for validation errors
  const [errors, setErrors] = useState({});
  // State for form submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State to control thank you modal visibility
  const [showThankYou, setShowThankYou] = useState(false);

  // Reference for scrolling to the form section
  const formRef = useRef(null);

  // List of Indian States for the dropdown
  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
    "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal"
  ];

  // Effect to handle scroll-based animations for highlights section
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1, // Trigger when 10% of the item is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-slide-in'); // Add animation class
        } else {
          entry.target.classList.remove('animate-slide-in'); // Remove if out of view
        }
      });
    }, observerOptions);

    // Observe each highlight item
    document.querySelectorAll('.highlight-item').forEach(item => {
      observer.observe(item);
    });

    // Cleanup observer on component unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  // Scrolls to the form section when "Join Now" is clicked
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Validates form fields
  const validateForm = () => {
    let newErrors = {};
    if (!fullName) newErrors.fullName = 'Full Name is required.';
    if (!email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email format is invalid.';
    }
    if (!mobile) {
      newErrors.mobile = 'Mobile Number is required.';
    } else if (!/^\d{10}$/.test(mobile)) {
      newErrors.mobile = 'Mobile Number must be 10 digits.';
    }
    if (!city) newErrors.city = 'City is required.';
    if (!selectedState) newErrors.selectedState = 'State is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handles form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (validateForm()) {
      // Simulate API call
      setTimeout(() => {
        console.log({ fullName, email, mobile, city, selectedState });
        setIsSubmitting(false);
        setShowThankYou(true); // Show thank you modal on success
        // Clear form fields
        setFullName('');
        setEmail('');
        setMobile('');
        setCity('');
        setSelectedState('');
        setErrors({}); // Clear any previous errors
      }, 1500);
    } else {
      setIsSubmitting(false);
    }
  };

  // Helper function for input styling based on validation
  // Modified to take the actual value of the field, not its string name.
  const getInputClass = (fieldName, fieldValue) => {
    const baseClasses = 'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 ease-in-out';
    if (errors[fieldName]) {
      return `${baseClasses} border-red-500 focus:ring-red-300`;
    }
    // Check if field has content and no error
    if (fieldValue && !errors[fieldName]) {
      return `${baseClasses} border-green-500 focus:ring-green-300`;
    }
    return `${baseClasses} border-gray-300 focus:ring-blue-300`;
  };

  return (
    <div className="min-h-screen bg-gray-100 font-inter text-gray-800">
      {/* Custom Styles for animations */}
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

        html {
          scroll-behavior: smooth;
        }

        .cricket-ball-animation {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }

        .animate-slide-in {
          opacity: 1;
          transform: translateY(0);
        }

        .highlight-item {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }

        .input-float-label {
            position: absolute;
            top: 50%;
            left: 1rem;
            transform: translateY(-50%);
            color: #9ca3af; /* gray-400 */
            transition: all 0.3s ease;
            pointer-events: none;
        }

        .input-group input:focus + .input-float-label,
        .input-group input:not(:placeholder-shown) + .input-float-label,
        .input-group select:focus + .input-float-label,
        .input-group select:not([value=""]) + .input-float-label {
            top: 0;
            transform: translateY(-50%);
            font-size: 0.75rem; /* text-xs */
            color: #4a90e2; /* A custom blue for focused/filled label */
            background-color: #f3f4f6; /* bg-gray-100 */
            padding: 0 0.25rem;
            left: 0.75rem;
        }

        .input-group select {
            appearance: none; /* Remove default arrow */
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="%234A90E2"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>');
            background-repeat: no-repeat;
            background-position: right 0.75rem center;
            background-size: 1.25rem;
            padding-right: 2.5rem; /* Make space for the arrow */
        }

        /* Loading spinner for submit button */
        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid #fff;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        `}
      </style>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center bg-cover bg-center rounded-b-3xl shadow-xl overflow-hidden"
        style={{
          backgroundImage: "url('https://aws-obg-image-lb-5.tcl.com/content/dam/brandsite/news/ioc/5.png?t=1740121362485&w=1200&webp=undefined&dpr=2.625&rendition=1068')", // Placeholder background image
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(0, 0, 0, 0.4)'
        }}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/70 to-purple-600/70 z-0"></div>
        <div className="relative z-10 p-6 sm:p-8 md:p-12 lg:p-16 text-white max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-xl md:text-5xl font-extrabold leading-tight drop-shadow-lg mb-4 animate-fade-in-up">
           Become TCL Premium Member for the Olympics Extravaganza!
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl font-light mb-8 drop-shadow-md animate-fade-in-up delay-200">
            Experience the thrill, get exclusive updates, and win exciting goodies!
          </p>
          <button
            onClick={scrollToForm}
            className="bg-blue-800 text-white border font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out text-lg animate-bounce-in"
          >
            Join Now
          </button>
          {/* Floating cricket ball animation */}
          <div className="absolute bottom-10 right-10 hidden md:block">
            <span className="text-6xl cricket-ball-animation" role="img" aria-label="Cricket Ball">
              🏏
            </span>
          </div>
        </div>
      </section>

      {/* About the Campaign Section */}
      <section className="py-16 bg-white rounded-t-3xl mt-[-2rem] relative z-10 shadow-lg">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
            TCL: Powering the Olympic Cricket Dream
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="md:w-1/2 text-lg leading-relaxed text-gray-700">
              <p className="mb-4">
                As a proud Olympic sponsor, TCL is committed to bringing the excitement of the games closer to you. This year, we're especially thrilled to celebrate Cricket's grand return to the Olympics!
              </p>
              <p>
                Join us in supporting your favorite cricket heroes and experience the pinnacle of sporting excellence with TCL's cutting-edge technology.
              </p>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img
                src="https://imageio.forbes.com/specials-images/imageserve/67b7a5bcc43b5b373e0d8fbd/0x0.jpg?format=jpg&height=900&width=1600&fit=bounds"
                alt="TCL Product with Olympic and Cricket Theme"
                className="rounded-xl shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Animated Highlights Section */}
      <section className="py-16 bg-blue-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-10">
            What You Get When You Join
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Highlight 1 */}
            <div className=" bg-blue-800 border p-8 rounded-xl shadow-lg flex flex-col items-center hover:bg-blue-900 transition duration-300">
              <Trophy className="w-16 h-16 mb-4 text-yellow-400" />
              <h3 className="text-2xl font-semibold mb-3">Win Big</h3>
              <p className="text-lg text-blue-200">
              Participate in contests and win a TCL Washing Machine 
              </p>
            </div>
            {/* Highlight 2 */}
            <div className=" bg-blue-800 p-8 border rounded-xl shadow-lg flex flex-col items-center hover:bg-blue-900 transition duration-300">
              <Tv className="w-16 h-16 mb-4 text-green-400" />
              <h3 className="text-2xl font-semibold mb-3">Exclusive Previews</h3>
              <p className="text-lg text-blue-200">
                Be the first to know about upcoming TCL products and special offers.
              </p>
            </div>
            {/* Highlight 3 - Using custom SVG for Cricket icon */}
            <div className=" bg-blue-800 border p-8 rounded-xl shadow-lg flex flex-col items-center hover:bg-blue-900 transition duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mb-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="var(--red-400)" />
                <path d="M12 2v10m-4-4l8 8m-8 0l8-8" stroke="#fff" strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="3" fill="#fff"/>
              </svg>
              <h3 className="text-2xl font-semibold mb-3">Support Your Heroes</h3>
              <p className="text-lg text-blue-200">
                Get behind your favorite cricket teams and athletes with dedicated content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Form Section */}
      <section ref={formRef} className="py-16 bg-gray-100">
        <div className="container mx-auto px-6 max-w-lg">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8">
           Join TCL Premium Membership!
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="relative input-group">
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className={getInputClass('fullName', fullName)}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={() => validateForm()}
                  placeholder=" " // Important for floating label
                />
                <label htmlFor="fullName" className="input-float-label">Full Name</label>
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div className="relative input-group">
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={getInputClass('email', email)}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => validateForm()}
                  placeholder=" "
                />
                <label htmlFor="email" className="input-float-label">Email Address</label>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Mobile Number */}
              <div className="relative input-group">
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  className={getInputClass('mobile', mobile)}
                  value={mobile}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only digits and limit to 10
                    if (/^\d*$/.test(value) && value.length <= 10) {
                      setMobile(value);
                    }
                  }}
                  onBlur={() => validateForm()}
                  placeholder=" "
                />
                <label htmlFor="mobile" className="input-float-label">Mobile Number</label>
                {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
              </div>

              {/* City */}
              <div className="relative input-group">
                <input
                  type="text"
                  id="city"
                  name="city"
                  className={getInputClass('city', city)}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onBlur={() => validateForm()}
                  placeholder=" "
                />
                <label htmlFor="city" className="input-float-label">City</label>
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>

              {/* State Dropdown */}
              <div className="relative input-group">
                <select
                  id="state"
                  name="state"
                  className={getInputClass('selectedState', selectedState)}
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  onBlur={() => validateForm()}
                >
                  <option value="" disabled>Select your State</option>
                  {states.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <label htmlFor="state" className="input-float-label">State</label>
                {errors.selectedState && <p className="text-red-500 text-sm mt-1">{errors.selectedState}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner mr-3"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Thank You Modal */}
      {showThankYou && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md w-full animate-scale-in">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🎉 Thank You for Joining the TCL Celebration!
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              You're now part of the exclusive TCL Premium Member. Get ready for exciting updates and opportunities!
            </p>
            {/* <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => alert("Simulating wallpaper download...")} // Using alert for demo purposes
                className="bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Wallpaper
              </button>
              <button
                onClick={() => {
                  alert("Redirecting to TCL's social media..."); // Using alert for demo purposes
                  setShowThankYou(false);
                }}
                className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-full shadow-md hover:bg-gray-300 transition duration-300 flex items-center justify-center"
              >
                Go to Social
              </button>
            </div> */}
            <button
              onClick={() => setShowThankYou(false)}
              className="mt-6 text-gray-600 hover:text-gray-900 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-6">
            <img src="/tcllogo.jpg" alt="TCL Logo" className="inline-block h-30 rounded-2xl mx-4" />
          </div>
          <p className="text-gray-400 mb-6">&copy; {new Date().getFullYear()} TCL. All rights reserved. Official Sponsor of the Olympic Games.</p>
          <div className="flex justify-center space-x-6">
            <a href="https://twitter.com/tcl_india" className="text-gray-400 hover:text-white transform hover:scale-125 transition duration-300" aria-label="Twitter">
              <Twitter className="w-7 h-7" />
            </a>
            <a href="https://www.facebook.com/TheCreativeLifeIndia/" className="text-gray-400 hover:text-white transform hover:scale-125 transition duration-300" aria-label="Facebook">
              <Facebook className="w-7 h-7" />
            </a>
            <a href="https://www.instagram.com/tcl_india/" className="text-gray-400 hover:text-white transform hover:scale-125 transition duration-300" aria-label="Instagram">
              <Instagram className="w-7 h-7" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
