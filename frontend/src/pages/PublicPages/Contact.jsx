import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Twitter,
  Github,
  Linkedin,
  Instagram,
  ArrowRight,
  HeadphonesIcon,
  Building2,
  Globe,
  Zap,
  Heart,
  HelpCircle,
  FileQuestion,
  Users,
  BookOpen,
} from "lucide-react";

// Magnetic Button Component
const MagneticButton = ({ children, className = "", ...props }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current?.getBoundingClientRect() || {};
    const x = (clientX - (left + width / 2)) * 0.3;
    const y = (clientY - (top + height / 2)) * 0.3;
    setPosition({ x, y });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 350, damping: 15 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Animated Input Component
const AnimatedInput = ({ label, type = "text", icon: Icon, value, onChange, error, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative group">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {label}
      </label>
      <div className="relative">
        {/* Glow Effect */}
        <motion.div
          className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"
          animate={{ opacity: isFocused ? 0.4 : 0 }}
        />
        
        {/* Input Container */}
        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-4 text-slate-400 dark:text-slate-500">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <input
            type={type}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full ${Icon ? "pl-12" : "pl-4"} pr-4 py-4 bg-white dark:bg-slate-800 border-2 ${
              error 
                ? "border-red-400 dark:border-red-500" 
                : isFocused 
                  ? "border-violet-500 dark:border-violet-400" 
                  : "border-slate-200 dark:border-slate-700"
            } rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all duration-300 shadow-sm hover:shadow-md`}
            {...props}
          />
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-500 flex items-center gap-1"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.p>
        )}
      </div>
    </div>
  );
};

// Animated Textarea Component
const AnimatedTextarea = ({ label, value, onChange, error, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative group">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <motion.div
          className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"
          animate={{ opacity: isFocused ? 0.4 : 0 }}
        />
        <textarea
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          rows={5}
          className={`relative w-full px-4 py-4 bg-white dark:bg-slate-800 border-2 ${
            error 
              ? "border-red-400 dark:border-red-500" 
              : isFocused 
                ? "border-violet-500 dark:border-violet-400" 
                : "border-slate-200 dark:border-slate-700"
          } rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all duration-300 resize-none shadow-sm hover:shadow-md`}
          {...props}
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-500 flex items-center gap-1"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.p>
        )}
      </div>
    </div>
  );
};

// Contact Card Component
const ContactCard = ({ icon: Icon, title, description, action, gradient, delay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="group relative"
    >
      <div className={`absolute -inset-1 bg-gradient-to-r ${gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
      
      <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-2xl p-6 border border-white/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 h-full">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
          {description}
        </p>
        <a
          href={action.href}
          className="inline-flex items-center gap-2 text-violet-600 dark:text-violet-400 font-medium text-sm hover:gap-3 transition-all duration-300"
        >
          {action.label}
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </motion.div>
  );
};

// FAQ Item Component
const FAQItem = ({ question, answer, isOpen, onToggle, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <div className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border-2 transition-all duration-300 ${
        isOpen 
          ? "border-violet-500/50 shadow-lg shadow-violet-500/10" 
          : "border-white/50 dark:border-slate-700/50 hover:border-violet-300 dark:hover:border-violet-700"
      }`}>
        <button
          onClick={onToggle}
          className="w-full px-6 py-5 flex items-center justify-between text-left"
        >
          <span className="font-semibold text-slate-900 dark:text-white pr-4">
            {question}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.3 }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isOpen 
                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500" 
                : "bg-slate-100 dark:bg-slate-800"
            }`}
          >
            <span className={`text-xl font-bold ${isOpen ? "text-white" : "text-slate-400"}`}>
              +
            </span>
          </motion.div>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-5 text-slate-600 dark:text-slate-300">
                {answer}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [openFAQ, setOpenFAQ] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setSubmitStatus("success");
    setFormData({ name: "", email: "", subject: "", message: "" });
    
    // Reset success message after 5 seconds
    setTimeout(() => setSubmitStatus(null), 5000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      description: "We'll respond within 24 hours",
      action: { label: "hello@cognito.edu", href: "mailto:hello@cognito.edu" },
      gradient: "from-violet-500 to-fuchsia-500",
    },
    {
      icon: HeadphonesIcon,
      title: "Live Support",
      description: "Available 24/7 for instant help",
      action: { label: "Start Chat", href: "#" },
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Building2,
      title: "Visit Us",
      description: "IIT Bombay Campus, Mumbai",
      action: { label: "Get Directions", href: "#" },
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: Clock,
      title: "Office Hours",
      description: "Mon-Fri: 9AM-6PM IST",
      action: { label: "Schedule Meeting", href: "#" },
      gradient: "from-amber-500 to-orange-500",
    },
  ];

  const faqs = [
    {
      question: "How does AI quiz generation work?",
      answer: "Our AI uses advanced natural language processing to analyze your content (topics, PDFs, or text) and automatically generates relevant, high-quality questions with multiple choice options, explanations, and difficulty levels.",
    },
    {
      question: "Is Cognito Learning Hub free to use?",
      answer: "Yes! Our core features including AI quiz generation, taking quizzes, 1v1 duels, and basic analytics are completely free. Premium features like advanced analytics, team management, and priority support are available in our Pro plan.",
    },
    {
      question: "Can I use this for my classroom?",
      answer: "Absolutely! Teachers love using our platform for live quiz sessions. Create quizzes, share a unique 6-digit code with students, and watch real-time participation with live leaderboards. Perfect for engaging classroom activities.",
    },
    {
      question: "What file formats are supported?",
      answer: "You can upload PDF documents, text files (.txt), and even paste YouTube video links. Our AI extracts the content and generates relevant quizzes automatically. We're constantly adding support for more formats.",
    },
    {
      question: "How secure is my data?",
      answer: "Security is our top priority. We use industry-standard encryption, secure authentication, and never share your personal data with third parties. Your quiz content and results are private and protected.",
    },
    {
      question: "Can I export my quizzes?",
      answer: "Yes! You can export your quizzes in multiple formats including PDF, JSON, and share them via unique links. Pro users also get access to advanced export options like SCORM packages for LMS integration.",
    },
  ];

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Instagram, href: "#", label: "Instagram" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/30 dark:from-slate-950 dark:via-violet-950/20 dark:to-fuchsia-950/20 overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[600px] h-[600px] -top-40 -right-40 bg-violet-400/20 dark:bg-violet-600/10 rounded-full blur-3xl"
          animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] bottom-20 -left-40 bg-fuchsia-400/20 dark:bg-fuchsia-600/10 rounded-full blur-3xl"
          animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-sm font-semibold mb-6"
            >
              <MessageCircle className="w-4 h-4" />
              We'd Love to Hear From You
            </motion.span>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              <span className="text-slate-900 dark:text-white">Get in</span>
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                {" "}Touch
              </span>
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Have questions, feedback, or just want to say hi? We're here to help 
              and would love to connect with you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="relative py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <ContactCard key={info.title} {...info} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-[3rem] blur-3xl" />
              
              <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl rounded-[2rem] p-8 lg:p-10 border border-white/50 dark:border-slate-700/50 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Send us a Message
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      We'll get back to you within 24 hours
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <AnimatedInput
                      label="Your Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      error={errors.name}
                      icon={Users}
                    />
                    <AnimatedInput
                      label="Email Address"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      error={errors.email}
                      icon={Mail}
                    />
                  </div>

                  <AnimatedInput
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    error={errors.subject}
                    icon={FileQuestion}
                  />

                  <AnimatedTextarea
                    label="Your Message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your question or feedback..."
                    error={errors.message}
                  />

                  <MagneticButton
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 rounded-xl text-white font-bold text-lg shadow-xl shadow-violet-500/30 hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-5 h-5" />
                        </motion.div>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Send Message
                        <Send className="w-5 h-5" />
                      </span>
                    )}
                  </MagneticButton>

                  {/* Success Message */}
                  <AnimatePresence>
                    {submitStatus === "success" && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-xl"
                      >
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                        <div>
                          <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                            Message sent successfully!
                          </p>
                          <p className="text-sm text-emerald-600 dark:text-emerald-400">
                            We'll get back to you soon.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </motion.div>

            {/* Map & Social */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Map Placeholder */}
              <div className="relative h-[300px] rounded-[2rem] overflow-hidden border border-white/50 dark:border-slate-700/50 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-4 shadow-xl">
                      <MapPin className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      IIT Bombay Campus
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                      Powai, Mumbai - 400076
                    </p>
                  </div>
                </div>
                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
                  backgroundSize: "40px 40px",
                }} />
              </div>

              {/* Social Links */}
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2rem] p-8 border border-white/50 dark:border-slate-700/50 shadow-xl">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                  Connect With Us
                </h3>
                <div className="flex flex-wrap gap-4">
                  {socialLinks.map((link, index) => (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.1, y: -5 }}
                      className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-gradient-to-br hover:from-violet-500 hover:to-fuchsia-500 hover:text-white transition-all duration-300 shadow-lg"
                    >
                      <link.icon className="w-6 h-6" />
                    </motion.a>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Follow us for updates, tips, and educational content. Join our growing community of learners!
                  </p>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-[2rem] p-8 shadow-xl text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-6 h-6" />
                  <h3 className="text-xl font-bold">Quick Links</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: HelpCircle, label: "Help Center" },
                    { icon: BookOpen, label: "Documentation" },
                    { icon: Users, label: "Community" },
                    { icon: Heart, label: "Support Us" },
                  ].map((link, i) => (
                    <motion.a
                      key={link.label}
                      href="#"
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors duration-300"
                    >
                      <link.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{link.label}</span>
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-sm font-semibold mb-4">
              FAQ
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
              Frequently Asked
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                {" "}Questions
              </span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Quick answers to common questions about Cognito Learning Hub
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === index}
                onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 mb-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-[3rem] blur-3xl opacity-30" />
            
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-12 lg:p-16 overflow-hidden border border-slate-700">
              {/* Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: "32px 32px",
                }} />
              </div>

              <div className="relative text-center text-white">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block mb-6"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-xl">
                    <Globe className="w-8 h-8" />
                  </div>
                </motion.div>

                <h2 className="text-4xl md:text-5xl font-black mb-6">
                  Can't Find What You're Looking For?
                </h2>
                <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                  Our support team is always ready to help. Reach out and we'll get back to you as soon as possible.
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                  <MagneticButton className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                    <span className="flex items-center gap-2">
                      <HeadphonesIcon className="w-5 h-5" />
                      Start Live Chat
                    </span>
                  </MagneticButton>
                  <MagneticButton className="px-8 py-4 bg-white/10 backdrop-blur-xl rounded-2xl text-white font-bold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Browse Help Center
                    </span>
                  </MagneticButton>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
