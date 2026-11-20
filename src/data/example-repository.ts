import "server-only";

export type ExampleRecord = {
  id: string;
};

export interface ExampleRepository {
  findAll(): Promise<ExampleRecord[]>;
}

export function createInMemoryExampleRepository(): ExampleRepository {
  return {
    async findAll() {
      return [];
    },
  };
}
