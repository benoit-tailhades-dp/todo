import { describe, expect, it } from "vitest";
import { composerRegistre, type Todo } from "./registre";

// Instants absolus. En novembre, Paris est à UTC + 1.
const VENDREDI_20_MIDI = Date.UTC(2026, 10, 20, 11, 0);

function todo(id: string, titre: string, creeLe: number): Todo {
  return { id, titre, creeLe, termine: false };
}

function termine(id: string, titre: string, creeLe: number): Todo {
  return { id, titre, creeLe, termine: true };
}

/** Un TODO en cours auquel on a choisi un autre jour que son jour d'ajout. */
function deplace(id: string, titre: string, creeLe: number, jour: string): Todo {
  return { id, titre, creeLe, termine: false, jour };
}

/** Titres des jours, avec le nombre et les identifiants de leurs TODO. */
function resume(todos: Todo[], maintenant = VENDREDI_20_MIDI) {
  return composerRegistre(todos, maintenant).jours.map(({ titre, nombre, todos: liste }) => ({
    titre,
    nombre,
    ids: liste.map((t) => t.id),
  }));
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
          { id: "a", titre: "Relancer le devis", termine: false },
          { id: "b", titre: "Relire le contrat de maintenance", termine: false },
        ],
      },
      {
        titre: "Aujourd'hui",
        nombre: 1,
        todos: [{ id: "c", titre: "Sauvegarder la base de recette", termine: false }],
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
    expect(dernier?.todos.at(-1)).toEqual({ id: "nouveau", titre: "Préparer l'ordre du jour", termine: false });
  });

  it("2 en cours et 1 terminé : les jours ne gardent que les en cours, le terminé va dans les terminés", () => {
    const registre = composerRegistre(
      [
        todo("a", "Relancer le devis", Date.UTC(2026, 10, 16, 9, 0)),
        termine("b", "Relire le contrat de maintenance", Date.UTC(2026, 10, 16, 15, 0)),
        todo("c", "Sauvegarder la base de recette", Date.UTC(2026, 10, 20, 8, 0)),
      ],
      VENDREDI_20_MIDI,
    );

    expect(registre.jours.map(({ titre, nombre, todos }) => ({ titre, nombre, ids: todos.map((t) => t.id) }))).toEqual([
      { titre: "Lundi 16 novembre", nombre: 1, ids: ["a"] },
      { titre: "Aujourd'hui", nombre: 1, ids: ["c"] },
    ]);
    expect(registre.termines).toEqual([{ id: "b", titre: "Relire le contrat de maintenance", termine: true }]);
    expect(registre.compteurs).toEqual({ enCours: 2, termines: 1, plusAncien: 4 });
    expect(registre.etat).toBe("liste");
  });

  it("chaque jour compte aussi ses TODO terminés, rangés sous leur jour choisi ou leur jour d'ajout", () => {
    const { jours } = composerRegistre(
      [
        todo("a", "Relancer le devis", Date.UTC(2026, 10, 16, 9, 0)),
        termine("b", "Relire le contrat de maintenance", Date.UTC(2026, 10, 16, 15, 0)),
        { ...termine("c", "Payer les cotisations", Date.UTC(2026, 10, 16, 16, 0)), jour: "2026-11-20" },
        todo("d", "Sauvegarder la base de recette", Date.UTC(2026, 10, 20, 8, 0)),
        termine("e", "Commander les cartes de visite", Date.UTC(2026, 10, 18, 8, 0)),
      ],
      VENDREDI_20_MIDI,
    );

    expect(jours.map(({ titre, nombre, termines }) => ({ titre, nombre, termines }))).toEqual([
      { titre: "Lundi 16 novembre", nombre: 1, termines: 1 },
      { titre: "Aujourd'hui", nombre: 1, termines: 1 },
    ]);
  });

  it("un TODO coché passe dans les terminés et le compteur des en cours baisse de 1", () => {
    const avant = [
      todo("a", "Relancer le devis", Date.UTC(2026, 10, 16, 9, 0)),
      todo("c", "Sauvegarder la base de recette", Date.UTC(2026, 10, 20, 8, 0)),
      termine("b", "Relire le contrat de maintenance", Date.UTC(2026, 10, 16, 15, 0)),
    ];
    const apres = avant.map((t) => (t.id === "c" ? { ...t, termine: true } : t));

    const { compteurs: compteursAvant } = composerRegistre(avant, VENDREDI_20_MIDI);
    const { compteurs, termines } = composerRegistre(apres, VENDREDI_20_MIDI);

    expect(compteurs.enCours).toBe(compteursAvant.enCours - 1);
    expect(compteurs.termines).toBe(compteursAvant.termines + 1);
    expect(termines.map((t) => t.id)).toContain("c");
  });

  it("le seul TODO en cours d'un jour terminé : l'en-tête de ce jour disparaît", () => {
    const { jours } = composerRegistre(
      [
        todo("a", "Relancer le devis", Date.UTC(2026, 10, 16, 9, 0)),
        termine("c", "Sauvegarder la base de recette", Date.UTC(2026, 10, 20, 8, 0)),
      ],
      VENDREDI_20_MIDI,
    );

    expect(jours.map((j) => j.titre)).toEqual(["Lundi 16 novembre"]);
  });

  it("tous les TODO terminés : état « tout terminé », aucun jour, plus ancien inconnu", () => {
    const registre = composerRegistre(
      [
        termine("a", "Relancer le devis", Date.UTC(2026, 10, 16, 9, 0)),
        termine("b", "Relire le contrat de maintenance", Date.UTC(2026, 10, 20, 8, 0)),
      ],
      VENDREDI_20_MIDI,
    );

    expect(registre.etat).toBe("tout-termine");
    expect(registre.jours).toEqual([]);
    expect(registre.compteurs).toEqual({ enCours: 0, termines: 2, plusAncien: null });
  });

  it("aucun TODO terminé : la liste des terminés est vide", () => {
    const registre = composerRegistre(
      [todo("a", "Relancer le devis", Date.UTC(2026, 10, 16, 9, 0))],
      VENDREDI_20_MIDI,
    );

    expect(registre.termines).toEqual([]);
    expect(registre.compteurs.termines).toBe(0);
  });

  it("aucun TODO : état « vide »", () => {
    expect(composerRegistre([], VENDREDI_20_MIDI).etat).toBe("vide");
  });

  it("range les terminés du plus ancien au plus récent", () => {
    const { termines } = composerRegistre(
      [
        termine("c", "Sauvegarder la base de recette", Date.UTC(2026, 10, 20, 8, 0)),
        termine("a", "Relancer le devis", Date.UTC(2026, 10, 16, 9, 0)),
        termine("b", "Relire le contrat de maintenance", Date.UTC(2026, 10, 18, 9, 0)),
      ],
      VENDREDI_20_MIDI,
    );

    expect(termines.map((t) => t.id)).toEqual(["a", "b", "c"]);
  });

  it("le plus ancien : l'âge en jours du plus ancien TODO en cours, pas d'un terminé", () => {
    const { compteurs } = composerRegistre(
      [
        termine("a", "Relancer le devis", Date.UTC(2026, 10, 12, 9, 0)),
        todo("b", "Relire le contrat de maintenance", Date.UTC(2026, 10, 18, 9, 0)),
      ],
      VENDREDI_20_MIDI,
    );

    expect(compteurs.plusAncien).toBe(2);
  });
});

describe("composerRegistre · jour choisi", () => {
  const LUNDI_16_9H = Date.UTC(2026, 10, 16, 8, 0);
  const LUNDI_16_15H = Date.UTC(2026, 10, 16, 14, 0);
  const JEUDI_19_10H = Date.UTC(2026, 10, 19, 9, 0);
  const VENDREDI_20_8H = Date.UTC(2026, 10, 20, 7, 0);
  const VENDREDI_20_9H = Date.UTC(2026, 10, 20, 8, 0);

  it("TODO d'aujourd'hui passé au lundi 16 : rangé sous « Lundi 16 novembre », les deux compteurs changent", () => {
    const avant = [
      todo("a", "Relancer le devis", LUNDI_16_9H),
      todo("b", "Relire le contrat de maintenance", LUNDI_16_15H),
      todo("c", "Sauvegarder la base de recette", VENDREDI_20_8H),
      todo("d", "Préparer l'ordre du jour", VENDREDI_20_9H),
    ];
    expect(resume(avant)).toEqual([
      { titre: "Lundi 16 novembre", nombre: 2, ids: ["a", "b"] },
      { titre: "Aujourd'hui", nombre: 2, ids: ["c", "d"] },
    ]);

    const apres = avant.map((t) => (t.id === "c" ? { ...t, jour: "2026-11-16" } : t));

    expect(resume(apres)).toEqual([
      { titre: "Lundi 16 novembre", nombre: 3, ids: ["a", "b", "c"] },
      { titre: "Aujourd'hui", nombre: 1, ids: ["d"] },
    ]);
  });

  it("samedi 21 pour l'un, mardi 24 pour l'autre : rangés après « Aujourd'hui », sous « Demain » puis « Mardi 24 novembre »", () => {
    const jours = resume([
      deplace("a", "Relancer le devis", LUNDI_16_9H, "2026-11-24"),
      deplace("b", "Relire le contrat de maintenance", LUNDI_16_15H, "2026-11-21"),
      todo("c", "Sauvegarder la base de recette", VENDREDI_20_8H),
    ]);

    expect(jours).toEqual([
      { titre: "Aujourd'hui", nombre: 1, ids: ["c"] },
      { titre: "Demain", nombre: 1, ids: ["b"] },
      { titre: "Mardi 24 novembre", nombre: 1, ids: ["a"] },
    ]);
  });

  it("jour à venir : sa clé, la date en clair à côté de « Demain », un âge négatif", () => {
    const { jours } = composerRegistre(
      [
        deplace("a", "Relancer le devis", LUNDI_16_9H, "2026-11-21"),
        deplace("b", "Relire le contrat de maintenance", LUNDI_16_15H, "2026-11-24"),
      ],
      VENDREDI_20_MIDI,
    );

    expect(jours.map(({ cle, precision, age }) => ({ cle, precision, age }))).toEqual([
      { cle: "2026-11-21", precision: "samedi 21 novembre", age: -1 },
      { cle: "2026-11-24", precision: null, age: -4 },
    ]);
  });

  it("dans un jour, l'ordre reste celui de l'ajout : un TODO venu d'« Hier » passe avant ceux ajoutés aujourd'hui", () => {
    const jours = resume([
      todo("c", "Sauvegarder la base de recette", VENDREDI_20_8H),
      deplace("h", "Relancer le devis", JEUDI_19_10H, "2026-11-20"),
      todo("d", "Préparer l'ordre du jour", VENDREDI_20_9H),
    ]);

    expect(jours).toEqual([{ titre: "Aujourd'hui", nombre: 3, ids: ["h", "c", "d"] }]);
  });

  it("le seul TODO en cours d'un jour déplacé : l'en-tête de ce jour disparaît", () => {
    const jours = resume([
      deplace("h", "Relancer le devis", JEUDI_19_10H, "2026-11-20"),
      todo("c", "Sauvegarder la base de recette", VENDREDI_20_8H),
    ]);

    expect(jours.map((j) => j.titre)).toEqual(["Aujourd'hui"]);
  });

  it("le plus ancien suit le jour affiché, pas le jour d'ajout", () => {
    const { compteurs } = composerRegistre(
      [
        deplace("a", "Relancer le devis", LUNDI_16_9H, "2026-11-21"),
        todo("h", "Relire le contrat de maintenance", JEUDI_19_10H),
      ],
      VENDREDI_20_MIDI,
    );

    expect(compteurs.plusAncien).toBe(1);
  });

  it("que des jours à venir : le plus ancien est inconnu", () => {
    const { compteurs } = composerRegistre(
      [deplace("a", "Relancer le devis", LUNDI_16_9H, "2026-11-21")],
      VENDREDI_20_MIDI,
    );

    expect(compteurs).toEqual({ enCours: 1, termines: 0, plusAncien: null });
  });
});
