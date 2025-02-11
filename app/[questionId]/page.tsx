import { quizQuestions } from "@/data/quizQuestions";
import QuizSlide from "@/components/Quiz/QuizSlide";
// import AudioToggle from "@/components/Quiz/AudioToggle"; // Optional
import { notFound } from "next/navigation";

interface Params {
  params: {
    questionId: string;
  };
}

export default function QuestionPage({ params }: Params) {
  const { questionId } = params;
  const questionData = quizQuestions[questionId];

  if (!questionData) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col items-center">
      <QuizSlide {...questionData} />
      {/* Optionally include AudioToggle or any other component */}
      {/* <AudioToggle /> */}
    </div>
  );
}
