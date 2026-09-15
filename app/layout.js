export const metadata = {
  title: "BudgetBite (Proof of Concept)",
  description: "Cheap, tasty recipes with listed macros",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", maxWidth: 640, margin: "40px auto", padding: "0 16px" }}>
        {children}
      </body>
    </html>
  );
}
