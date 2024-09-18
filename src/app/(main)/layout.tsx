import SessionProvider from "./SessionProvider";
import NavBar from "@/components/NavBar";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen flex-col">
        <NavBar />
        <main className="container mx-auto flex-grow px-4 py-8">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
