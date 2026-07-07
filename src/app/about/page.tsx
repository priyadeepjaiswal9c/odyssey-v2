import type { Metadata } from "next";
import Home from "../page";

export const metadata: Metadata = {
  title: "Priyadeep Jaiswal — About",
  alternates: { canonical: "/about" },
};

/** deep link: same world, lands in the about realm after Enter */
export default Home;
