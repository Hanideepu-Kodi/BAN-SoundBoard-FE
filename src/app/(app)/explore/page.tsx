import { Suspense } from "react";
import ExplorePage from "@/components/ExplorePage";

export default function Explore() {
  return (
    <Suspense fallback={null}>
      <ExplorePage />
    </Suspense>
  );
}
