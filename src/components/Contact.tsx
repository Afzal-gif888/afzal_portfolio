"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Send, Mail, User, MessageSquare, FileText, Loader2, Sparkles } from "lucide-react";
import { trackEvent, EVENTS } from "@/lib/analytics";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      toast.error("Contact form is not configured yet.");
      setSending(false);
      return;
    }

    try {
      const emailjs = (await import("@emailjs/browser")).default;
      await emailjs.send(serviceId, templateId, {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
      }, publicKey);

      toast.success("Message sent successfully! I'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
      trackEvent(EVENTS.CONTACT_SUBMIT);
    } catch (error) {
      console.error("EmailJS Error:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section id="contact" className="w-full max-w-[1200px] mx-auto px-6 py-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Let&apos;s Connect
          </motion.div>
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-3">
            Get In Touch
          </motion.h2>
          <motion.div
            variants={{
              hidden: { width: 0, opacity: 0 },
              visible: { width: 48, opacity: 1, transition: { duration: 0.6 } }
            }}
            className="h-1 bg-primary rounded-full mx-auto mb-4"
          ></motion.div>
          <motion.p variants={itemVariants} className="text-muted-foreground max-w-lg mx-auto text-base">
            Have a project in mind or want to discuss an opportunity? I&apos;d love to hear from you.
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
          <div className="relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-xl overflow-hidden">
            {/* Top gradient accent bar */}
            <div className="h-1 w-full bg-linear-to-r from-primary/60 via-primary to-primary/60" />

            {/* Subtle corner glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <form onSubmit={handleSubmit} className="relative p-6 sm:p-8 space-y-5">
              {/* Row: Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <motion.div variants={itemVariants} className="relative">
                  <label htmlFor="contact-name" className="block text-sm font-medium text-foreground mb-2">
                    Name
                  </label>
                  <div className={`relative rounded-xl border transition-all duration-300 ${
                    focusedField === "name"
                      ? "border-primary shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
                      : "border-border/80 hover:border-border"
                  } bg-background/60`}>
                    <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${
                      focusedField === "name" ? "text-primary" : "text-muted-foreground/50"
                    }`} />
                    <input
                      id="contact-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Your name"
                      className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none rounded-xl"
                      required
                    />
                  </div>
                </motion.div>

                {/* Email */}
                <motion.div variants={itemVariants} className="relative">
                  <label htmlFor="contact-email" className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <div className={`relative rounded-xl border transition-all duration-300 ${
                    focusedField === "email"
                      ? "border-primary shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
                      : "border-border/80 hover:border-border"
                  } bg-background/60`}>
                    <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${
                      focusedField === "email" ? "text-primary" : "text-muted-foreground/50"
                    }`} />
                    <input
                      id="contact-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="your@email.com"
                      className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none rounded-xl"
                      required
                    />
                  </div>
                </motion.div>
              </div>

              {/* Subject */}
              <motion.div variants={itemVariants} className="relative">
                <label htmlFor="contact-subject" className="block text-sm font-medium text-foreground mb-2">
                  Subject
                </label>
                <div className={`relative rounded-xl border transition-all duration-300 ${
                  focusedField === "subject"
                    ? "border-primary shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
                    : "border-border/80 hover:border-border"
                } bg-background/60`}>
                  <FileText className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${
                    focusedField === "subject" ? "text-primary" : "text-muted-foreground/50"
                  }`} />
                  <input
                    id="contact-subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    onFocus={() => setFocusedField("subject")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="What's this about?"
                    className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none rounded-xl"
                    required
                  />
                </div>
              </motion.div>

              {/* Message */}
              <motion.div variants={itemVariants} className="relative">
                <label htmlFor="contact-message" className="block text-sm font-medium text-foreground mb-2">
                  Message
                </label>
                <div className={`relative rounded-xl border transition-all duration-300 ${
                  focusedField === "message"
                    ? "border-primary shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
                    : "border-border/80 hover:border-border"
                } bg-background/60`}>
                  <MessageSquare className={`absolute left-3.5 top-4 h-4 w-4 transition-colors duration-300 ${
                    focusedField === "message" ? "text-primary" : "text-muted-foreground/50"
                  }`} />
                  <textarea
                    id="contact-message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    onFocus={() => setFocusedField("message")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Tell me about your project, idea, or just say hello..."
                    className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none rounded-xl resize-none h-36"
                    required
                  />
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  disabled={sending}
                  size="lg"
                  className="w-full rounded-xl font-semibold text-base py-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {sending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" /> Send Message
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
