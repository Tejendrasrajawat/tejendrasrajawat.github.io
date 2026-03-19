import type { Metadata } from "next";
import ApiTesterPageClient from "./ApiTesterPageClient";

export const metadata: Metadata = {
  title: "API Tester",
  description:
    "Test REST APIs instantly. Send GET, POST, PUT, DELETE requests with headers, auth, and body. Copy as cURL or fetch. No signup required.",
  keywords: [
    "API tester",
    "REST API",
    "HTTP client",
    "API testing",
    "curl",
    "fetch",
  ],
  openGraph: {
    title: "API Tester | DevKit",
    description:
      "Test REST APIs instantly. Send requests with headers, auth, and body. Copy as cURL or fetch.",
  },
};

export default function ApiTesterPage() {
  return <ApiTesterPageClient />;
}
