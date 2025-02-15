"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-romanticPink flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Welcome to Our Valentine Experience</h1>
      <div className="grid gap-8 md:grid-cols-2">
        {/* Quiz Card */}
        <Link href="/quiz/start" passHref>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="max-w-sm"
          >
            <Card className="p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Take the Quiz</h2>
              <p className="mb-6">
                re-take the valentine quiz :)
              </p>
              <Button variant="secondary" className="w-full">
                Start Quiz
              </Button>
            </Card>
          </motion.div>
        </Link>

        {/* Scrapbook Card */}
        <Link href="/scrapbook" passHref>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="max-w-sm"
          >
            <Card className="p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Digital Scrapbook</h2>
              <p className="mb-6">
                view and add memories 😁
              </p>
              <Button variant="secondary" className="w-full">
                View Scrapbook
              </Button>
            </Card>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
