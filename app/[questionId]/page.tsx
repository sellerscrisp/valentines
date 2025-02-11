import { notFound } from "next/navigation";
import QuizSlide from "@/components/Quiz/QuizSlide";
import { quizQuestions } from "@/data/quizQuestions";

// Define the props type expected by Next.js
interface PageProps {
  params: {
    questionId: string;
  };
}

export default async function QuestionPage({ params }: PageProps) {
  const { questionId } = params;
  const questionData = quizQuestions[questionId];

  if (!questionData) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col justify-start items-center p-4">
      <QuizSlide {...questionData} />
      {/* Optionally include other components like AudioToggle */}
    </div>
  );
}
