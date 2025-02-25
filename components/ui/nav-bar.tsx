"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "./button";
// import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { title: "Home", href: "/" },
  { title: "Valentine's Quiz", href: "/quiz/start" },
  { title: "Scrapbook", href: "/scrapbook" },
  { title: "Login", href: "/login" },
];

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  // const pathname = usePathname();
  
  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ ease: "easeIn", duration: 0.1 }}
        className="fixed top-4 left-0 right-0 z-50 mx-auto"
      >
        <nav className="mx-4">
          <motion.div 
            className="flex h-14 items-center border-secondary/60 justify-between px-4 border bg-secondary/60 backdrop-blur-xl rounded-xl"
          >
            <Link href="/" className="flex items-center">
              <span className="text-lg font-bold">💝</span>
            </Link>
            
            <Button
              variant="link"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="relative h-8 w-8"
            >
              <motion.div
                className="flex w-6 flex-col items-end space-y-1.5"
                animate={isOpen ? "open" : "closed"}
                transition={{ duration: 0.1, ease: "easeIn" }}
              >
                <motion.span
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: 45, y: 8 },
                  }}
                  transition={{ duration: 0.1, ease: "easeIn" }}
                  className="h-0.5 w-6 bg-foreground origin-center"
                />
                <motion.span
                  variants={{
                    closed: { opacity: 1 },
                    open: { opacity: 0 },
                  }}
                  transition={{ duration: 0.1, ease: "easeIn" }}
                  className="h-0.5 w-6 bg-foreground"
                />
                <motion.span
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: -45, y: -8 },
                  }}
                  transition={{ duration: 0.1, ease: "easeIn" }}
                  className="h-0.5 w-6 bg-foreground origin-center"
                />
              </motion.div>
            </Button>
          </motion.div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.1, ease: "easeIn" }}
            className="fixed top-20 left-0 right-0 z-40 mx-4"
          >
            <div className="border border-secondary/60 bg-secondary/60 backdrop-blur-xl px-5 py-3 space-y-2">
              {navItems.map((item) => (
                <motion.div
                  key={item.href}
                  initial={{ y: 0, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ 
                    delay: 0.1,
                    duration: 0.1,
                    ease: "easeIn"
                  }}
                >
                  <Link href={item.href}>
                    <button
                      className="w-full justify-start text-right text-lg font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.title}
                    </button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 