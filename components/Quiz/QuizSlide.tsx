"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

interface QuizSlideProps {
    id: string;
    imageUrl?: string;
    header?: string;
    question: string;
    yesNext: string | null;
    noNext?: string | null; // Allow undefined
    yesLabel?: string;
    noLabel?: string;
    showConfetti?: boolean;
}

export default function QuizSlide({
    id,
    imageUrl,
    header,
    question,
    yesNext,
    noNext,
    yesLabel,
    noLabel,
    showConfetti: confettiEnabled,
}: QuizSlideProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { width, height } = useWindowSize();
    const [confettiVisible, setConfettiVisible] = useState(false);

    // For anti-cursor behavior on the "no" button
    const [noButtonStyle, setNoButtonStyle] = useState<React.CSSProperties>({});

    // On mount, check for the query parameter to trigger confetti on the next slide.
    useEffect(() => {
        if (searchParams.get("confetti") === "true") {
            setConfettiVisible(true);
        }
    }, [searchParams]);

    const handleYes = () => {
        if (confettiEnabled && yesNext) {
            // Navigate immediately to the next question with the confetti flag.
            router.push(`/${yesNext}?confetti=true`);
        } else if (yesNext) {
            router.push(`/${yesNext}`);
        }
    };

    const handleNo = () => {
        if (noNext) {
            router.push(`/${noNext}`);
        }
    };

    const handleBack = () => {
        if (id === "start") {
            // Do nothing if this is the start slide.
            return;
        }
        router.back();
    };

    // Randomize the "no" button's position ensuring at least 50px difference from its current position.
    const randomizeNoButtonPosition = () => {
        const buttonWidth = 100; // Adjust as needed for your button size
        const buttonHeight = 50; // Adjust as needed for your button size

        // Ensure currentX/currentY are numbers.
        const currentX = typeof noButtonStyle.left === "number" ? noButtonStyle.left : 0;
        const currentY = typeof noButtonStyle.top === "number" ? noButtonStyle.top : 0;

        let randomX = Math.floor(Math.random() * (window.innerWidth - buttonWidth));
        let randomY = Math.floor(Math.random() * (window.innerHeight - buttonHeight));

        // Ensure the new X position is at least 50px away from the current X position.
        while (Math.abs(randomX - currentX) < 50) {
            randomX = Math.floor(Math.random() * (window.innerWidth - buttonWidth));
        }

        // Ensure the new Y position is at least 50px away from the current Y position.
        while (Math.abs(randomY - currentY) < 50) {
            randomY = Math.floor(Math.random() * (window.innerHeight - buttonHeight));
        }

        setNoButtonStyle({
            position: "fixed",
            left: randomX,
            top: randomY,
            transition: "all 0.1s ease-in-out",
        });
    };

    return (
        <motion.div
            className="relative flex flex-col p-4 max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            {confettiVisible && (
                <div className="fixed top-0 left-0 z-50 pointer-events-none">
                    <Confetti
                        width={width}
                        height={height}
                        recycle={true}
                        numberOfPieces={40}
                        colors={["red"]}
                        frameRate={120}
                        drawShape={(ctx) => {
                            ctx.beginPath();
                            // Scaled-down heart shape:
                            ctx.moveTo(0, -4);
                            ctx.bezierCurveTo(-6, -10, -15, -10, -15, 0);
                            ctx.bezierCurveTo(-15, 10, 0, 14, 0, 18);
                            ctx.bezierCurveTo(0, 14, 15, 10, 15, 0);
                            ctx.bezierCurveTo(15, -10, 6, -10, 0, -4);
                            ctx.closePath();
                            ctx.fill();
                        }}
                    />
                </div>
            )}

            <Card className="relative w-full px-8 py-10">
                {imageUrl && (
                    <div className="w-full mb-4">
                        <img src={imageUrl} alt={header} className="w-full" />
                    </div>
                )}
                <h2 className="text-2xl font-bold mb-2 text-romanticRed font-pacifico">
                    {header ?? ""}
                </h2>
                <p className="text-lg mb-6">{question}</p>
                <div className="flex space-x-4">
                    {yesNext && (
                        <Button
                            variant="secondary"
                            onClick={handleYes}
                            className="hover:scale-105 transition-transform duration-200"
                        >
                            {yesLabel || "Yes"}
                        </Button>
                    )}

                    {/* For the last "no" slide, make the "no" button anti-cursor */}
                    {noNext &&
                        (id === "noResponseFinally" ? (
                            <Button
                                onMouseEnter={randomizeNoButtonPosition}
                                onMouseMove={randomizeNoButtonPosition}
                                onFocus={randomizeNoButtonPosition}
                                style={noButtonStyle}
                                className="hover:scale-105 transition-transform duration-200"
                            >
                                {noLabel || "No"}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNo}
                                className="hover:scale-105 transition-transform duration-200"
                            >
                                {noLabel || "No"}
                            </Button>
                        ))}

                    {id !== "start" && (
                        <Button
                            variant="link"
                            onClick={handleBack}
                            className="text-tertiary"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="h-5 w-5" /> Back
                        </Button>
                    )}
                </div>
            </Card>
        </motion.div>
    );
}