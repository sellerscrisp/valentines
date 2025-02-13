"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface BookViewProps {
    onClose: () => void;
}

export default function BookView({ onClose }: BookViewProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const pages = [
        {
            content: "Page 1: Our first memory together. It was magical!",
            image: "https://via.placeholder.com/1200x800?text=Page+1",
        },
        {
            content: "Page 2: A fun day at the beach, full of laughter.",
            image: "https://via.placeholder.com/1200x800?text=Page+2",
        },
        {
            content: "Page 3: Cherished moments that last forever.",
            image: "https://via.placeholder.com/1200x800?text=Page+3",
        },
    ];

    const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, pages.length - 1));
    const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 0));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
            <div className="relative bg-white w-full h-full p-4 overflow-hidden">
                <motion.div
                    key={currentPage}
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="p-4 h-full flex flex-col items-center justify-center"
                >
                    <img
                        src={pages[currentPage].image}
                        alt={`Page ${currentPage + 1}`}
                        className="w-full h-2/3 object-cover mb-4"
                    />
                    <p className="text-xl text-center">{pages[currentPage].content}</p>
                </motion.div>
                <div className="absolute bottom-4 left-0 right-0 flex justify-between px-4">
                    <Button variant="outline" size="icon" onClick={prevPage} disabled={currentPage === 0}>
                        <ArrowLeft />
                    </Button>
                    <Button onClick={onClose} variant="destructive">
                        Close
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextPage} disabled={currentPage === pages.length - 1}>
                        <ArrowRight />
                    </Button>
                </div>
            </div>
        </div>
    );
}
