import type { ExampleRecord, ExampleRepository } from "@/data/example-repository";

export type ExampleService = {
  list(): Promise<ExampleRecord[]>;
};

export function createExampleService(repository: ExampleRepository): ExampleService {
  return {
    list() {
      return repository.findAll();
    },
  };
}
