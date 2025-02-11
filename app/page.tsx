import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to the first quiz slide (e.g., "start")
  redirect("/start");
}