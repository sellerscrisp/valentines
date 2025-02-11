// app/[questionId]/page.tsx

import { notFound } from "next/navigation";
import QuizSlide from "@/components/Quiz/QuizSlide";
import { quizQuestions } from "@/data/quizQuestions";

// Instead of using a custom PageProps type that only allows { questionId: string },
// update the props type to allow params to be a Promise.
export default async function QuestionPage({
  params,
}: {
  params: { questionId: string } | Promise<{ questionId: string }>;
}) {
  // Await params in case it is a Promise
  const { questionId } = await params;
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
