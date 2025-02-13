export type QuizQuestion = {
    id: string;
    imageUrl?: string;
    header?: string;
    question: string;
    yesNext: string | null;
    noNext?: string | null;
    yesLabel?: string;
    noLabel?: string;
    showConfetti?: boolean;
};

export const quizQuestions: Record<string, QuizQuestion> = {
    start: {
        id: "start",
        imageUrl: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmQ3c2JheXdrZG53MXIxcGw0dmRpbWgzamh5Y2VhMjk4d2RvazZ2dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/W4Q0G0EX6nBkrLZx66/giphy.gif",
        header: "",
        question: "will you be my valentine? 😍",
        yesNext: "quiz/yesResponseImmediately",
        noNext: "quiz/noResponse1",
        yesLabel: "yes",
        noLabel: "no",
        showConfetti: true,
    },
    noResponse1: {
        id: "noResponse1",
        imageUrl: "https://media1.tenor.com/m/Exn9VkWI1jsAAAAd/he-strongly-disagree-disagree-cat.gif",
        header: "very strongly.",
        question: "excuse me...",
        yesNext: "quiz/yesResponseFinally",
        noNext: "quiz/noResponse2",
        yesLabel: "okay fine",
        noLabel: "nope",
    },
    noResponse2: {
        id: "noResponse2",
        imageUrl: "https://media1.tenor.com/m/nBR_oOC_J0YAAAAd/cat-angry.gif",
        header: "",
        question: "why do you keep saying no???😡",
        yesNext: "quiz/yesResponseFinally",
        noNext: "quiz/noResponseFinally",
        yesLabel: "i guess",
        noLabel: "no 😠"
    },
    noResponseFinally: {
        id: "noResponseFinally",
        imageUrl: "https://media1.tenor.com/m/kEjTMxgbFZYAAAAd/smirk-cat.gif",
        header: "",
        question: "you can't say no now you little freaky bunkey 🐇🐒",
        yesNext: "quiz/yesResponseFinally",
        noNext: ".",
        yesLabel: "fine...",
        noLabel: "never!!",
        showConfetti: true,
    },
    yesResponseFinally: {
        id: "yesResponseFinally",
        imageUrl: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXdhbDMwZ254dHdhdm5nODgzOGkwZ2EybWQ3dGlxcWJhaGlxMW82dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/EuesNM8qJVOTu/giphy.gif",
        header: "you finally came around:)",
        question: "wanna go on a date?",
        yesNext: "quiz/yesDate",
        yesLabel: "absolutely;)",
        noNext: null,
        showConfetti: true,
    },
    yesResponseImmediately: {
        id: "yesResponseFinally",
        imageUrl: "https://media1.tenor.com/m/tSBqNM9Y8mwAAAAC/love-dog.gif",
        header: "i love you so much 💗💗",
        question: "wanna go on a date?",
        yesNext: "yesDate",
        yesLabel: "absolutely;)",
        noNext: null,
        showConfetti: true,
    },
    yesDate: {
        id: "yesDate",
        imageUrl: "https://media.tenor.com/ir-_bntmpAgAAAAi/cocopry-stich.gif",
        header: "let's go to sakura 🍚🍹",
        question: "i love you baby love ",
        yesNext: null,
        noNext: null,
        showConfetti: true,
    },
};
