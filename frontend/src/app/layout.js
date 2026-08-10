import "./globals.css";
import Navbar from "../components/Navbar";
import { UserProvider } from "../context/UserContext";

export const metadata = {
  title: "Leaf & Letter | Book reviews worth sharing",
  description: "Discover thoughtful books and share reviews with fellow readers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <Navbar />
          <main>{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}
