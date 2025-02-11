// app/[questionId]/page.tsx
import { notFound } from "next/navigation";
import QuizSlide from "@/components/Quiz/QuizSlide";
import { quizQuestions } from "@/data/quizQuestions";

// Now declare that params is a Promise resolving to an object with questionId.
type PageProps = {
  params: Promise<{ questionId: string }>;
};

export default async function QuestionPage({ params }: PageProps) {
  // Await params to unwrap the value.
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
