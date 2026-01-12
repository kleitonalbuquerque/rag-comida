import { render, screen } from "@testing-library/react";
import { MessageList } from "../components/MessageList";

const base = (ts) => ({ id: "1", role: "user", text: "Oi", ts });

describe("MessageList", () => {
  it("mostra horario formatado", () => {
    const spy = jest
      .spyOn(Date.prototype, "toLocaleTimeString")
      .mockReturnValue("10:00:00");

    render(
      <MessageList
        messages={[base("2024-01-01T10:00:00Z")]}
        listRef={{ current: null }}
      />
    );

    expect(screen.getByText("10:00:00")).toBeInTheDocument();
    spy.mockRestore();
  });

  it("nao quebra com ts invalido", () => {
    render(
      <MessageList messages={[base("abc")]} listRef={{ current: null }} />
    );
    expect(screen.getByText("Oi")).toBeInTheDocument();
  });
});
