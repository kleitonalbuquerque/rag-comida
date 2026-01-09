import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HomePage from "../app/page";

global.crypto = {
  randomUUID: () => "test-id",
};

describe("Chat flow", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("envia mensagem e desabilita input enquanto carrega", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ answer: "Resposta" }),
    });

    render(<HomePage />);

    const input = screen.getByPlaceholderText(/Pergunte algo/);
    const button = screen.getByRole("button", { name: /enviar/i });

    fireEvent.change(input, { target: { value: "pizza" } });
    fireEvent.click(button);

    expect(button).toBeDisabled();

    await waitFor(() => screen.getByText("Resposta"));
    expect(button).not.toBeDisabled();
  });

  it("limpa o chat", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ answer: "Oi" }),
    });

    render(<HomePage />);

    const input = screen.getByPlaceholderText(/Pergunte algo/);
    const send = screen.getByRole("button", { name: /enviar/i });
    fireEvent.change(input, { target: { value: "teste" } });
    fireEvent.click(send);
    await waitFor(() => screen.getByText("Oi"));

    const clear = screen.getByRole("button", { name: /Limpar chat/i });
    fireEvent.click(clear);

    expect(screen.queryByText("Oi")).toBeNull();
  });
});
