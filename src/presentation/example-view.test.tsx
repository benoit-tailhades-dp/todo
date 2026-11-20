// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExampleView } from "./example-view";

describe("ExampleView", () => {
  it("affiche un titre", () => {
    render(<ExampleView />);

    expect(screen.getByRole("heading", { level: 1, name: "Exemple" })).toBeDefined();
  });
});
