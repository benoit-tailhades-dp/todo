import { describe, expect, it } from "vitest";
import type { ExampleRepository } from "@/data/example-repository";
import { createExampleService } from "./example-service";

describe("ExampleService", () => {
  it("renvoie ce que fournit le repository", async () => {
    const fakeRepository: ExampleRepository = {
      async findAll() {
        return [{ id: "1" }];
      },
    };
    const service = createExampleService(fakeRepository);

    expect(await service.list()).toEqual([{ id: "1" }]);
  });
});
