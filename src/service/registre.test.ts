import { describe, expect, it } from "vitest";
import { composerRegistre, type Todo } from "./registre";

// Instants absolus. En novembre, Paris est à UTC + 1.
const VENDREDI_20_MIDI = Date.UTC(2026, 10, 20, 11, 0);

function todo(id: string, titre: string, creeLe: number): Todo {
  return { id, titre, creeLe, termine: false };
}

describe("composerRegistre", () => {
  it("base sans TODO : aucun jour à afficher", () => {
    expect(composerRegistre([], VENDREDI_20_MIDI).jours).toEqual([]);
  });

  it("donne la date du jour en toutes lettres", () => {
    expect(composerRegistre([], VENDREDI_20_MIDI).dateDuJour).toBe("Vendredi 20 novembre");
  });

  it("range par jour d'ajout, du plus ancien au plus récent, avec le nombre de TODO de chaque jour", () => {
    const { jours } = composerRegistre(
      [
        todo("c", "Sauvegarder la base de recette", Date.UTC(2026, 10, 20, 8, 0)),
        todo("b", "Relire le contrat de maintenance", Date.UTC(2026, 10, 16, 15, 0)),
        todo("a", "Relancer le devis", Date.UTC(2026, 10, 16, 9, 0)),
      ],
      VENDREDI_20_MIDI,
    );

    expect(jours.map(({ titre, nombre, todos }) => ({ titre, nombre, todos }))).toEqual([
      {
        titre: "Lundi 16 novembre",
        nombre: 2,
        todos: [
          { id: "a", titre: "Relancer le devis" },
          { id: "b", titre: "Relire le contrat de maintenance" },
        ],
      },
      {
        titre: "Aujourd'hui",
        nombre: 1,
        todos: [{ id: "c", titre: "Sauvegarder la base de recette" }],
      },
    ]);
  });

  it("donne à chaque jour sa clé, la précision de sa date et son âge en jours", () => {
    const { jours } = composerRegistre(
      [
        todo("a", "Relancer le devis", Date.UTC(2026, 10, 16, 9, 0)),
        todo("c", "Sauvegarder la base de recette", Date.UTC(2026, 10, 20, 8, 0)),
      ],
      VENDREDI_20_MIDI,
    );

    expect(jours.map(({ cle, precision, age }) => ({ cle, precision, age }))).toEqual([
      { cle: "2026-11-16", precision: null, age: 4 },
      { cle: "2026-11-20", precision: "vendredi 20 novembre", age: 0 },
    ]);
  });

  it("TODO ajouté le 19 novembre à 23 h 30 à Paris, ouvert le 20 : rangé sous « Hier », même en UTC", () => {
    // 19 novembre 23 h 30 à Paris = 22 h 30 UTC. Ouverture le 20 à 0 h 15 à Paris = 19 novembre 23 h 15 UTC :
    // un calcul en UTC mettrait les deux le même jour et dirait « Aujourd'hui ».
    const { jours } = composerRegistre(
      [todo("a", "Relancer le devis", Date.UTC(2026, 10, 19, 22, 30))],
      Date.UTC(2026, 10, 19, 23, 15),
    );

    expect(jours.map(({ titre, precision }) => ({ titre, precision }))).toEqual([
      { titre: "Hier", precision: "jeudi 19 novembre" },
    ]);
  });

  it("un TODO ajouté maintenant se range en dernier sous « Aujourd'hui »", () => {
    const { jours } = composerRegistre(
      [
        todo("a", "Relancer le devis", Date.UTC(2026, 10, 16, 9, 0)),
        todo("b", "Sauvegarder la base de recette", Date.UTC(2026, 10, 20, 8, 0)),
        todo("nouveau", "Préparer l'ordre du jour", VENDREDI_20_MIDI),
      ],
      VENDREDI_20_MIDI,
    );

    const dernier = jours.at(-1);
    expect(dernier?.titre).toBe("Aujourd'hui");
    expect(dernier?.todos.at(-1)).toEqual({ id: "nouveau", titre: "Préparer l'ordre du jour" });
  });
});
