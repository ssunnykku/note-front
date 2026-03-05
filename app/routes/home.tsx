import type { Route } from "./+types/home";
import Header from "~/components/ui/Header";
import Body from "~/components/ui/Body";
import Footer from "~/components/ui/Footer";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Note" },
    { name: "description", content: "노트 작성 서비스" },
  ];
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Body>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome to Note
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          노트 작성 서비스에 오신 것을 환영합니다.
        </p>
      </Body>
      <Footer />
    </div>
  );
}
