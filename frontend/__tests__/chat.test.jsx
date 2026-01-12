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
    expect(screen.queryByText("Buscando resposta...")).toBeNull();
    expect(global.fetch).toHaveBeenCalledTimes(1);
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

  it("exibe horario nas mensagens", async () => {
    const fixed = new Date("2024-01-01T12:34:56Z");
    jest.useFakeTimers().setSystemTime(fixed);
    const timeSpy = jest
      .spyOn(Date.prototype, "toLocaleTimeString")
      .mockReturnValue("12:34:56");

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ answer: "Resposta" }),
    });

    render(<HomePage />);

    const input = screen.getByPlaceholderText(/Pergunte algo/);
    const button = screen.getByRole("button", { name: /enviar/i });

    fireEvent.change(input, { target: { value: "massa" } });
    fireEvent.click(button);

    await waitFor(() => screen.getByText("Resposta"));

    const times = screen.getAllByText("12:34:56");
    expect(times.length).toBeGreaterThanOrEqual(2); // user e bot

    timeSpy.mockRestore();
    jest.useRealTimers();
  });

  it("mostra erro quando fetch falha", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });

    render(<HomePage />);

    const input = screen.getByPlaceholderText(/Pergunte algo/);
    const button = screen.getByRole("button", { name: /enviar/i });

    fireEvent.change(input, { target: { value: "erro" } });
    fireEvent.click(button);

    await waitFor(() => screen.getByText(/Erro ao buscar/));
  });

  it("limita historico a 6 mensagens", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ answer: "Resp" }),
    });

    render(<HomePage />);

    const input = screen.getByPlaceholderText(/Pergunte algo/);
    const button = screen.getByRole("button", { name: /enviar/i });

    const send = (text) => {
      fireEvent.change(input, { target: { value: text } });
      fireEvent.click(button);
    };

    // Envia 7 mensagens para forcar truncamento a ultimas 6
    for (let i = 1; i <= 7; i++) {
      send(`m${i}`);
      await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(i));
    }

    // Agora o historico envia apenas as 4 ultimas entradas (user/bot) + atual.
    // Antes da 7a pergunta, as ultimas entradas são m5, m6 e seus bots.
    const body = JSON.parse(global.fetch.mock.lastCall[1].body);
    expect(body.message).toMatch(/m5/);
    expect(body.message).not.toMatch(/m4/);
  });
});
