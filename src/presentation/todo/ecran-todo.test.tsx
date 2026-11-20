// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import type { Registre } from "@/service/todo-service";
import { ChargementListe } from "./chargement-liste";
import { EcranTodo } from "./ecran-todo";

const VIDE: Registre = { dateDuJour: "Vendredi 20 novembre", jours: [] };

const DEUX_JOURS: Registre = {
  dateDuJour: "Vendredi 20 novembre",
  jours: [
    {
      cle: "2026-11-16",
      titre: "Lundi 16 novembre",
      precision: null,
      age: 4,
      nombre: 2,
      todos: [
        { id: "a", titre: "Relancer le devis" },
        { id: "b", titre: "Relire le contrat de maintenance" },
      ],
    },
    {
      cle: "2026-11-20",
      titre: "Aujourd'hui",
      precision: "vendredi 20 novembre",
      age: 0,
      nombre: 1,
      todos: [{ id: "c", titre: "Sauvegarder la base de recette" }],
    },
  ],
};

/** Valeur d'une cellule d'en-tête de jour (« Âge », « TODO »). */
function cellule(section: HTMLElement, libelle: string): string | null | undefined {
  return within(section).getByText(libelle, { selector: "dt" }).nextElementSibling?.textContent;
}

afterEach(cleanup);

describe("EcranTodo", () => {
  it("affiche le bandeau : « Mes TODO » et la date du jour", () => {
    render(<EcranTodo registre={VIDE} />);

    expect(screen.getByRole("heading", { level: 1, name: "Mes TODO" })).toBeDefined();
    expect(screen.getByText("Vendredi 20 novembre")).toBeDefined();
  });

  it("base sans TODO : affiche « Aucun TODO pour l'instant »", () => {
    render(<EcranTodo registre={VIDE} />);

    expect(screen.getByRole("heading", { level: 2, name: "Aucun TODO pour l'instant" })).toBeDefined();
    expect(screen.queryByRole("listitem")).toBeNull();
  });

  it("affiche un en-tête par jour, dans l'ordre reçu, chacun avec son nombre de TODO", () => {
    render(<EcranTodo registre={DEUX_JOURS} />);

    const titres = screen.getAllByRole("heading", { level: 2 }).map((titre) => titre.textContent);
    expect(titres).toEqual(["Lundi 16 novembre", "Aujourd'hui"]);
    expect(cellule(screen.getByRole("region", { name: "Lundi 16 novembre" }), "TODO")).toBe("2");
    expect(cellule(screen.getByRole("region", { name: "Aujourd'hui" }), "TODO")).toBe("1");
    expect(screen.queryByText("Aucun TODO pour l'instant")).toBeNull();
  });

  it("affiche les TODO de chaque jour dans l'ordre reçu", () => {
    render(<EcranTodo registre={DEUX_JOURS} />);

    const lundi = screen.getByRole("region", { name: "Lundi 16 novembre" });
    expect(within(lundi).getAllByRole("listitem").map((ligne) => ligne.textContent)).toEqual([
      "Relancer le devis",
      "Relire le contrat de maintenance",
    ]);
    const aujourdhui = screen.getByRole("region", { name: "Aujourd'hui" });
    expect(within(aujourdhui).getAllByRole("listitem").map((ligne) => ligne.textContent)).toEqual([
      "Sauvegarder la base de recette",
    ]);
  });

  it("précise la date à côté de « Aujourd'hui » et donne l'âge de chaque jour", () => {
    render(<EcranTodo registre={DEUX_JOURS} />);

    const aujourdhui = screen.getByRole("region", { name: "Aujourd'hui" });
    expect(within(aujourdhui).getByText("vendredi 20 novembre")).toBeDefined();
    expect(cellule(screen.getByRole("region", { name: "Lundi 16 novembre" }), "Âge")).toContain("4 j");
  });
});

describe("ChargementListe", () => {
  it("annonce le chargement de la liste", () => {
    render(<ChargementListe />);

    expect(screen.getByRole("status").textContent).toBe("Chargement de ta liste…");
  });
});
