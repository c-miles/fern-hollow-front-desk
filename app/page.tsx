// ADOPTED: the Grainient pine field (timeSpeed 0.6) is the page background
// for ALL views. This placeholder shows the field only; Task 6 builds the
// real parent chat on top of it. Keep components/grainient.tsx as-is.
import { Source_Serif_4 } from "next/font/google";
import Grainient from "@/components/grainient";

const serif = Source_Serif_4({ subsets: ["latin"], weight: ["500", "600"] });

export default function Home() {
  return (
    <div className="relative min-h-dvh" style={{ background: "#16382E" }}>
      <Grainient color1="#35705B" color2="#1F4D3F" color3="#16382E" timeSpeed={0.6} grainAmount={0.08} />
      <div className="relative z-10 flex min-h-dvh items-center justify-center">
        <p className={`${serif.className} text-2xl font-semibold`} style={{ color: "#F2F0EA" }}>
          Fern Hollow Early Learning
        </p>
      </div>
    </div>
  );
}
