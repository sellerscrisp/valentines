// app/[questionId]/page.tsx
import { notFound } from "next/navigation";
import QuizSlide from "@/components/Quiz/QuizSlide";
import { quizQuestions } from "@/data/quizQuestions";

// Allow params to be either a plain object or a Promise that resolves to that object.
type PageProps = {
  params: { questionId: string } | Promise<{ questionId: string }>;
};

export default async function QuestionPage({ params }: PageProps) {
  // If params is a Promise, await it; otherwise use it directly.
  const resolvedParams = params instanceof Promise ? await params : params;
  const { questionId } = resolvedParams;
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
