"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import OptimizedImage from "@/components/OptimizedImage";
import { ExternalLink, Award } from "lucide-react";

interface Certificate {
  id: string;
  name: string;
  organization: string;
  date: string;
  credentialId: string;
  verificationUrl: string;
  imageUrl: string;
  order: number;
}

export default function Certificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCertificates() {
      try {
        const q = query(collection(db, "certificates"), orderBy("order", "asc"));
        const querySnapshot = await getDocs(q);
        const fetched: Certificate[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data() as Certificate;
          if (process.env.NODE_ENV === "production") {
            console.log("[Certificates] Firestore imageUrl for", docSnap.id, ":", data.imageUrl);
          }
          // Exclude any `id` field that might exist in the document data to avoid duplicate property errors.
          const { id: _ignored, ...rest } = data as { id?: string };
          fetched.push({ id: docSnap.id, ...rest } as Certificate);
        });
        setCertificates(fetched);
      } catch (error) {
        console.error("Error fetching certificates:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCertificates();
  }, []);

  if (loading || certificates.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section id="certificates" className="w-full max-w-[1200px] mx-auto px-6 py-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-2">Certifications</motion.h2>
        <motion.div 
          variants={{
            hidden: { width: 0, opacity: 0 },
            visible: { width: 48, opacity: 1, transition: { duration: 0.6 } }
          }}
          className="h-1 bg-primary rounded-full mb-8"
        ></motion.div>

        <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <motion.div
              key={cert.id}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group flex flex-col border rounded-xl overflow-hidden bg-card hover:shadow-lg hover:border-primary/30 transition-all duration-300"
            >
              {cert.imageUrl ? (
                <div className="relative w-full h-44 bg-muted">
                  <OptimizedImage src={cert.imageUrl} alt={cert.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-contain p-3" />
                </div>
              ) : (
                <div className="w-full h-28 flex items-center justify-center bg-muted/50 border-b">
                  <Award className="h-12 w-12 text-muted-foreground/30" />
                </div>
              )}

              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-base leading-tight mb-1">{cert.name}</h3>
                <p className="text-sm font-medium text-primary">{cert.organization}</p>
                <p className="text-xs text-muted-foreground mt-1 mb-3">{cert.date}</p>
                
                {cert.credentialId && (
                  <p className="text-xs text-muted-foreground mb-3">
                    ID: <span className="font-mono">{cert.credentialId}</span>
                  </p>
                )}

                <div className="flex-1" />

                {cert.verificationUrl && (
                  <motion.a
                    whileHover={{ x: 5 }}
                    href={cert.verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline pt-3 border-t"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Verify Credential
                  </motion.a>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
