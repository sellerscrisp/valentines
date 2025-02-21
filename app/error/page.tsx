import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ErrorPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted relative overflow-hidden">
            {/* Background Heart SVG */}
            <svg
                className="absolute -z-10 opacity-5 w-[150%] max-w-none h-auto"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    fill="url(#gradient)"
                    stroke="none"
                />
                <defs>
                    <linearGradient id="gradient" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#ec4899" />
                        <stop offset="1" stopColor="#8b5cf6" />
                    </linearGradient>
                </defs>
            </svg>

            <div className="relative z-10 text-center">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-violet-500 text-transparent bg-clip-text">
                    Access Denied
                </h1>
                <p className="mb-8 text-muted-foreground text-lg">
                    You are not authorized to log in with this account.
                </p>
                <Link href="/login">
                    <Button className="px-8 py-6 text-lg rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                        Try Again
                    </Button>
                </Link>
            </div>
        </div>
    );
}