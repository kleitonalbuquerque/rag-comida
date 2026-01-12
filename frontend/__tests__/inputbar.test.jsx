import { fireEvent, render, screen } from "@testing-library/react";
import { InputBar } from "../components/InputBar";

describe("InputBar", () => {
  it("envia com Enter sem Shift", () => {
    const onSend = jest.fn((e) => e.preventDefault());
    render(
      <InputBar
        value="oi"
        onChange={() => {}}
        onSend={onSend}
        disabled={false}
      />
    );
    const textarea = screen.getByPlaceholderText(/Pergunte algo/);
    fireEvent.keyDown(textarea, {
      key: "Enter",
      shiftKey: false,
      preventDefault: jest.fn(),
    });
    expect(onSend).toHaveBeenCalled();
  });

  it("nao envia com Shift+Enter", () => {
    const onSend = jest.fn((e) => e.preventDefault());
    render(
      <InputBar
        value="oi"
        onChange={() => {}}
        onSend={onSend}
        disabled={false}
      />
    );
    const textarea = screen.getByPlaceholderText(/Pergunte algo/);
    fireEvent.keyDown(textarea, {
      key: "Enter",
      shiftKey: true,
      preventDefault: jest.fn(),
    });
    expect(onSend).not.toHaveBeenCalled();
  });

  it("nao envia se disabled", () => {
    const onSend = jest.fn((e) => e.preventDefault());
    render(
      <InputBar
        value="oi"
        onChange={() => {}}
        onSend={onSend}
        disabled={true}
      />
    );
    const textarea = screen.getByPlaceholderText(/Pergunte algo/);
    fireEvent.keyDown(textarea, {
      key: "Enter",
      shiftKey: false,
      preventDefault: jest.fn(),
    });
    expect(onSend).not.toHaveBeenCalled();
  });

  it("botao desabilita com input vazio", () => {
    const onSend = jest.fn((e) => e.preventDefault());
    render(
      <InputBar value="" onChange={() => {}} onSend={onSend} disabled={false} />
    );
    const button = screen.getByRole("button", { name: /enviar/i });
    expect(button).toBeDisabled();
  });
});
