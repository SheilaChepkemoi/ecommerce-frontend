import Navbar from "@/components/shop/Navbar"
import Footer from "@/components/shop/Footer";

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="d-flex min-vh-100 flex-column">
      <Navbar />

      <main className="flex-grow-1">
        {children}
      </main>

      <Footer/>

    </div>
  );
}