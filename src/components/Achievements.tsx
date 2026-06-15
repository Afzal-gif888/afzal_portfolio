"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trophy } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  order: number;
}

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const q = query(collection(db, "achievements"), orderBy("order", "asc"));
        const querySnapshot = await getDocs(q);
        const fetched: Achievement[] = [];
        querySnapshot.forEach((docSnap) => {
          fetched.push({ id: docSnap.id, ...docSnap.data() } as Achievement);
        });
        setAchievements(fetched);
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAchievements();
  }, []);

  if (loading || achievements.length === 0) return null;

  return (
    <section id="achievements" className="w-full max-w-[1200px] mx-auto px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold mb-2">Achievements</h2>
        <div className="w-12 h-1 bg-primary rounded-full mb-8"></div>

        <div className="grid gap-4 md:grid-cols-2">
          {achievements.map((achievement, idx) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="flex items-start gap-4 p-5 border rounded-xl bg-card hover:shadow-md transition-all hover:-translate-y-0.5 duration-300"
            >
              <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{achievement.title}</h3>
                <div className="flex items-center gap-2 mt-1 mb-2">
                  <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded-full">{achievement.category}</span>
                  <span className="text-xs text-muted-foreground">{achievement.date}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{achievement.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
