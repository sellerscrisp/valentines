// app/[questionId]/page.tsx
import { notFound } from "next/navigation";
import QuizSlide from "@/components/Quiz/QuizSlide";
import { quizQuestions } from "@/data/quizQuestions";

export default async function QuestionPage({
  params,
}: {
  params: { questionId: string };
}) {
  // Wrap params in Promise.resolve so that "await" returns the same object.
  const { questionId } = await Promise.resolve(params);
  const questionData = quizQuestions[questionId];

  if (!questionData) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col justify-start items-center p-4">
      <QuizSlide {...questionData} />
      {/* Optionally include other components */}
    </div>
  );
}
