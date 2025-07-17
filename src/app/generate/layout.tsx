import "~/styles/globals.css";

import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Social Department",
  description:
    "Social Department is a platform for creating social media content for your brand.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <main className="flex flex-col">{children}</main>;
}
