import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-white p-4">
        <h1 className="text-xl font-bold">My App</h1>
      </header>
      <main className="flex-1 p-6">{children}</main>
      <footer className="bg-gray-200 text-gray-700 p-4 text-center">
        © 2025 My App
      </footer>
    </div>
  );
}
