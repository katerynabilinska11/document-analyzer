
import { InputFile } from "@/components/ui/fileInput";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-4">
      <h1 className="text-3xl font-bold text-center">Welcome to Document Analyzer</h1>
      <InputFile/>
    </main>
  );
}
