import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#111318] flex flex-col justify-between overflow-hidden">
      <Navbar />
      <Hero />
    </main>
  );
}
