"use client";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#09090b]">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <span>Made with</span>
          <svg
            className="w-4 h-4 text-red-500 animate-pulse"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
          <span>by</span>
          <a
            href="https://md-zayed-ghanchi.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 underline decoration-dotted underline-offset-4"
          >
            Zayed
          </a>
        </div>
      </div>
    </footer>
  );
}
