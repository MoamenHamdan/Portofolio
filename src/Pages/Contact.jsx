import { useState, useEffect } from "react";
import { Share2, User, Mail, MessageSquare, Send } from "lucide-react";
import SocialLinks from "../components/SocialLinks";
import Komentar from "../components/Commentar";
import { db, collection, addDoc, serverTimestamp } from "../firebase";
import Swal from "sweetalert2";
import AOS from "aos";
import "aos/dist/aos.css";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Rate-limiting: 60-second cooldown after successful send.
  // This is a CLIENT-SIDE friction layer — not a substitute for
  // Firestore Security Rules validation (see firestore.rules).
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    AOS.init({ once: true });
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cooldown > 0 || isSubmitting) return;

    // Client-side validation — mirrors Firestore rules constraints
    if (formData.name.trim().length < 2 || formData.name.length > 100) {
      Swal.fire({ title: 'Invalid Name', text: 'Name must be 2–100 characters.', icon: 'warning', confirmButtonColor: '#ef4444' });
      return;
    }
    if (formData.message.trim().length < 10 || formData.message.length > 2000) {
      Swal.fire({ title: 'Invalid Message', text: 'Message must be 10–2000 characters.', icon: 'warning', confirmButtonColor: '#ef4444' });
      return;
    }

    setIsSubmitting(true);
    Swal.fire({
      title: 'Sending Message...',
      html: 'Please wait while we send your message',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      await addDoc(collection(db, "messages"), {
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        timestamp: serverTimestamp(),
      });

      Swal.fire({
        title: 'Success!',
        text: 'Your message has been sent successfully!',
        icon: 'success',
        confirmButtonColor: '#ef4444',
        timer: 2000,
        timerProgressBar: true
      });
      setFormData({ name: "", email: "", message: "" });
      setCooldown(60); // prevent re-submit for 60 seconds
    } catch (error) {
      console.error("Error sending message:", error);
      Swal.fire({
        title: 'Error!',
        text: 'Something went wrong. Please try again later.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="text-center lg:mt-[5%] mt-10 mb-2 sm:px-0 px-[5%]">
        <h2
          data-aos="fade-down"
          data-aos-duration="1000"
          className="text-3xl md:text-5xl font-bold text-center mx-auto text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-900 uppercase font-mono tracking-widest glitch-text"
          data-text="Contact Me"
        >
          Contact Me
        </h2>
        <p
          data-aos="fade-up"
          data-aos-duration="1100"
          className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base mt-2"
        >
          Have a project in mind or just want to say hi? I'd love to hear from you.
        </p>
      </div>

      <div
        className="h-auto py-10 flex items-center justify-center px-[5%] md:px-0"
        id="Contact"
      >
        <div className="container px-[1%] grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-[minmax(0,45fr)_minmax(0,55fr)] 2xl:grid-cols-[minmax(0,35fr)_minmax(0,65fr)] gap-12">
          <div
            data-aos="fade-right"
            data-aos-duration="1200"
            className="bg-white/2 backdrop-blur-xl rounded-2xl shadow-2xl p-5 py-10 sm:p-10 border border-white/5 transition-all duration-300 hover:border-white/10"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 
                  className="text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#ef4444] to-[#991b1b] font-mono tracking-wider glitch-text uppercase"
                  data-text="Let's Connect"
                >
                  Let's Connect
                </h2>
                <p className="text-gray-400">
                  Ready to start a new project? Reach out and let's build something exceptional.
                </p>
              </div>
              <Share2 className="w-10 h-10 text-[#ef4444] opacity-30" />
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              <div
                data-aos="fade-up"
                data-aos-delay="100"
                className="relative group"
              >
                <User className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-[#ef4444] transition-colors" />
                <input
                  type="text"
                  name="name"
                    aria-label="Name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full p-4 pl-12 bg-white/10 rounded-xl border border-white/20 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-[#ef4444]/30 transition-all duration-300 hover:border-[#ef4444]/30 disabled:opacity-50"
                  required
                />
              </div>
              <div
                data-aos="fade-up"
                data-aos-delay="200"
                className="relative group"
              >
                <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-[#ef4444] transition-colors" />
                <input
                  type="email"
                    aria-label="Email" maxLength={320}
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full p-4 pl-12 bg-white/10 rounded-xl border border-white/20 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-[#ef4444]/30 transition-all duration-300 hover:border-[#ef4444]/30 disabled:opacity-50"
                  required
                />
              </div>
              <div
                data-aos="fade-up"
                data-aos-delay="300"
                className="relative group"
              >
                <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-[#ef4444] transition-colors" />
                <textarea
                  name="message"
                    aria-label="Message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full resize-none p-4 pl-12 bg-white/10 rounded-xl border border-white/20 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-[#ef4444]/30 transition-all duration-300 hover:border-[#ef4444]/30 h-[9.9rem] disabled:opacity-50"
                  required
                />
              </div>
              <button
                data-aos="fade-up"
                data-aos-delay="400"
                type="submit"
                disabled={isSubmitting || cooldown > 0}
                className="w-full bg-gradient-to-r from-[#ef4444] to-[#991b1b] text-white py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#ef4444]/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Send className="w-5 h-5" />
                {isSubmitting ? 'Sending...' : cooldown > 0 ? `Please wait ${cooldown}s` : 'Send Message'}
              </button>
            </form>

            <div className="mt-10 pt-6 border-t border-white/10 flex justify-center space-x-6">
              <SocialLinks />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-3 py-3 md:p-10 md:py-8 shadow-2xl transform transition-all duration-300 hover:shadow-[#ef4444]/10">
            <Komentar />
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
