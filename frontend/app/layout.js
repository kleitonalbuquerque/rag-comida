export const metadata = {
  title: "Chatbot de Comidas e Receitas",
  description: "Interface de chat para buscar receitas com RAG",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
