import { describe, expect, it } from "vitest";
import { createInMemoryExampleRepository } from "./example-repository";

describe("ExampleRepository (en mémoire)", () => {
  it("renvoie une liste vide", async () => {
    const repository = createInMemoryExampleRepository();

    expect(await repository.findAll()).toEqual([]);
  });
});
