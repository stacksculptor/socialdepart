import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center text-white pt-16 min-h-screen">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Accelerated <span className="text-[hsl(280,100%,70%)]">social content</span> 
          <br />
          <span className="text-[hsl(280,100%,70%)]">
            for entertainment marketing
          </span>
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="/generate"
          >
            <h3 className="text-2xl font-bold">Generate Manually →</h3>
            <div className="text-lg">
              You can generate content manually by inputting a several values and selecting several options.
            </div>
          </Link>
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            href="/upload"
          >
            <h3 className="text-2xl font-bold">Upload PDF →</h3>
            <div className="text-lg">
              You can upload a PDF and the system will generate a summary of the content.
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
