import { renderBoard } from "../src/render-board.js";

describe("renderBoard", () => {
  it("renders the stock, waste, foundations, and tableau labels", () => {
    const output = renderBoard();

    expect(output).toContain("Stock:");
    expect(output).toContain("Waste:");
    expect(output).toContain("Foundations:");
    expect(output).toContain("T1");
    expect(output).toContain("T7");
  });
});
