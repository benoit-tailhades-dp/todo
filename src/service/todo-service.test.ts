import { describe, expect, it } from "vitest";
import type { TodoEnregistre, TodoRepository } from "@/data/todo-repository";
import { composerRegistre } from "./registre";
import { createTodoService } from "./todo-service";

// Instants absolus. En novembre, Paris est à UTC + 1.
const VENDREDI_20_MIDI = Date.UTC(2026, 10, 20, 11, 0);

/** Faux repository en mémoire : garde ce qu'on lui confie et note les écritures. */
function fauxRepository(depart: TodoEnregistre[] = []) {
  let todos = depart.map((t) => ({ ...t }));
  const ajouts: TodoEnregistre[] = [];
  const terminaisons: string[] = [];
  const changementsDeJour: Array<{ id: string; jour: string }> = [];
  const repository: TodoRepository = {
    async listerTous() {
      return todos.map((t) => ({ ...t }));
    },
    async ajouter(todo) {
      ajouts.push(todo);
      todos.push({ ...todo });
    },
    async trouver(id) {
      const todo = todos.find((t) => t.id === id);
      return todo ? { ...todo } : null;
    },
    async marquerTermine(id) {
      terminaisons.push(id);
      todos = todos.map((t) => (t.id === id ? { ...t, termine: true } : t));
    },
    async changerJour(id, jour) {
      changementsDeJour.push({ id, jour });
      todos = todos.map((t) => (t.id === id ? { ...t, jour } : t));
    },
  };
  return { repository, ajouts, terminaisons, changementsDeJour };
}

function todo(id: string, titre: string, creeLe: number): TodoEnregistre {
  return { id, titre, creeLe, termine: false };
}

describe("TodoService.lister", () => {
  it("renvoie les TODO du repository", async () => {
    const enBase = [todo("a", "Relancer le devis", Date.UTC(2026, 10, 16, 9, 0))];
    const { repository } = fauxRepository(enBase);

    expect(await createTodoService(repository).lister()).toEqual(enBase);
  });
});

describe("TodoService.ajouter", () => {
  it("enregistre un TODO en cours, daté de maintenant, et le renvoie", async () => {
    const { repository, ajouts } = fauxRepository();

    const resultat = await createTodoService(repository).ajouter("Relancer le devis", VENDREDI_20_MIDI);

    expect(ajouts).toHaveLength(1);
    const [enregistre] = ajouts;
    expect(enregistre).toMatchObject({ titre: "Relancer le devis", creeLe: VENDREDI_20_MIDI, termine: false });
    expect(enregistre.id).toMatch(/\S/);
    expect(resultat).toEqual({ ok: true, todo: enregistre });
  });

  it("donne à chaque TODO un identifiant différent", async () => {
    const { repository, ajouts } = fauxRepository();
    const service = createTodoService(repository);

    await service.ajouter("Relancer le devis", VENDREDI_20_MIDI);
    await service.ajouter("Relancer le devis", VENDREDI_20_MIDI);

    expect(ajouts[0].id).not.toBe(ajouts[1].id);
  });

  it("retire les espaces autour du titre avant d'enregistrer", async () => {
    const { repository, ajouts } = fauxRepository();

    await createTodoService(repository).ajouter("  Relancer le devis  ", VENDREDI_20_MIDI);

    expect(ajouts.map((t) => t.titre)).toEqual(["Relancer le devis"]);
  });

  it("titre vide ou fait d'espaces : n'enregistre rien et demande un titre", async () => {
    const { repository, ajouts } = fauxRepository();
    const service = createTodoService(repository);

    expect(await service.ajouter("", VENDREDI_20_MIDI)).toEqual({ ok: false, erreur: "titre-vide" });
    expect(await service.ajouter("   ", VENDREDI_20_MIDI)).toEqual({ ok: false, erreur: "titre-vide" });
    expect(ajouts).toEqual([]);
  });

  it("le TODO ajouté apparaît en dernier sous « Aujourd'hui »", async () => {
    const { repository } = fauxRepository([
      todo("a", "Relire le contrat de maintenance", Date.UTC(2026, 10, 16, 9, 0)),
      todo("b", "Sauvegarder la base de recette", Date.UTC(2026, 10, 20, 8, 0)),
    ]);
    const service = createTodoService(repository);

    await service.ajouter("Relancer le devis", VENDREDI_20_MIDI);

    const { jours } = composerRegistre(await service.lister(), VENDREDI_20_MIDI);
    expect(jours.map((j) => j.titre)).toEqual(["Lundi 16 novembre", "Aujourd'hui"]);
    expect(jours[1].todos.map((t) => t.titre)).toEqual([
      "Sauvegarder la base de recette",
      "Relancer le devis",
    ]);
  });

  it("sans TODO du jour, l'ajout crée l'en-tête « Aujourd'hui »", async () => {
    const { repository } = fauxRepository([
      todo("a", "Relire le contrat de maintenance", Date.UTC(2026, 10, 16, 9, 0)),
    ]);
    const service = createTodoService(repository);

    await service.ajouter("Relancer le devis", VENDREDI_20_MIDI);

    const { jours } = composerRegistre(await service.lister(), VENDREDI_20_MIDI);
    expect(jours.map(({ titre, nombre }) => ({ titre, nombre }))).toEqual([
      { titre: "Lundi 16 novembre", nombre: 1 },
      { titre: "Aujourd'hui", nombre: 1 },
    ]);
  });
});

describe("TodoService.terminer", () => {
  const enBase = [
    todo("a", "Relancer le devis", Date.UTC(2026, 10, 20, 8, 0)),
    todo("b", "Relire le contrat de maintenance", Date.UTC(2026, 10, 20, 9, 0)),
  ];

  it("TODO en cours : l'enregistre comme terminé", async () => {
    const { repository, terminaisons } = fauxRepository(enBase);
    const service = createTodoService(repository);

    expect(await service.terminer("a")).toEqual({ ok: true });

    expect(terminaisons).toEqual(["a"]);
    expect((await service.lister()).map(({ id, termine }) => ({ id, termine }))).toEqual([
      { id: "a", termine: true },
      { id: "b", termine: false },
    ]);
  });

  it("identifiant inconnu : ne modifie rien et dit que le TODO est introuvable", async () => {
    const { repository, terminaisons } = fauxRepository(enBase);
    const service = createTodoService(repository);

    expect(await service.terminer("inconnu")).toEqual({ ok: false, erreur: "introuvable" });
    expect(await service.terminer(undefined)).toEqual({ ok: false, erreur: "introuvable" });

    expect(terminaisons).toEqual([]);
    expect(await service.lister()).toEqual(enBase);
  });

  it("TODO déjà terminé : il reste terminé et aucun autre TODO ne change", async () => {
    const depart = [{ ...enBase[0], termine: true }, enBase[1]];
    const { repository, terminaisons } = fauxRepository(depart);
    const service = createTodoService(repository);

    expect(await service.terminer("a")).toEqual({ ok: true });

    expect(terminaisons).toEqual([]);
    expect(await service.lister()).toEqual(depart);
  });
});

describe("TodoService.changerDate", () => {
  const enBase = [
    todo("a", "Relancer le devis", Date.UTC(2026, 10, 16, 9, 0)),
    todo("h", "Relire le contrat de maintenance", Date.UTC(2026, 10, 19, 9, 0)),
    todo("c", "Sauvegarder la base de recette", Date.UTC(2026, 10, 20, 8, 0)),
    todo("d", "Préparer l'ordre du jour", Date.UTC(2026, 10, 20, 9, 0)),
  ];

  /** Titres des jours affichés, avec les identifiants de leurs TODO. */
  async function joursAffiches(service: ReturnType<typeof createTodoService>, maintenant = VENDREDI_20_MIDI) {
    return composerRegistre(await service.lister(), maintenant).jours.map(({ titre, nombre, todos }) => ({
      titre,
      nombre,
      ids: todos.map((t) => t.id),
    }));
  }

  it("TODO d'aujourd'hui, lundi 16 choisi : enregistré sous « Lundi 16 novembre », les deux compteurs changent", async () => {
    const { repository, changementsDeJour } = fauxRepository(enBase);
    const service = createTodoService(repository);

    expect(await service.changerDate("c", "2026-11-16")).toEqual({ ok: true });

    expect(changementsDeJour).toEqual([{ id: "c", jour: "2026-11-16" }]);
    expect(await joursAffiches(service)).toEqual([
      { titre: "Lundi 16 novembre", nombre: 2, ids: ["a", "c"] },
      { titre: "Hier", nombre: 1, ids: ["h"] },
      { titre: "Aujourd'hui", nombre: 1, ids: ["d"] },
    ]);
  });

  it("samedi 21 pour l'un, mardi 24 pour l'autre : rangés après « Aujourd'hui », sous « Demain » puis « Mardi 24 novembre »", async () => {
    const { repository } = fauxRepository(enBase);
    const service = createTodoService(repository);

    await service.changerDate("a", "2026-11-21");
    await service.changerDate("h", "2026-11-24");

    expect((await joursAffiches(service)).map((j) => j.titre)).toEqual([
      "Aujourd'hui",
      "Demain",
      "Mardi 24 novembre",
    ]);
  });

  it("TODO d'« Hier » déposé sur « Aujourd'hui » : il prend la date du jour, et l'en-tête « Hier » disparaît", async () => {
    const { repository, changementsDeJour } = fauxRepository(enBase);
    const service = createTodoService(repository);

    expect(await service.changerDate("h", "2026-11-20")).toEqual({ ok: true });

    expect(changementsDeJour).toEqual([{ id: "h", jour: "2026-11-20" }]);
    expect(await joursAffiches(service)).toEqual([
      { titre: "Lundi 16 novembre", nombre: 1, ids: ["a"] },
      { titre: "Aujourd'hui", nombre: 3, ids: ["h", "c", "d"] },
    ]);
  });

  it("son propre jour : rien n'est enregistré", async () => {
    const { repository, changementsDeJour } = fauxRepository([
      ...enBase,
      { ...todo("m", "Commander les badges", Date.UTC(2026, 10, 17, 9, 0)), jour: "2026-11-23" },
    ]);
    const service = createTodoService(repository);

    expect(await service.changerDate("c", "2026-11-20")).toEqual({ ok: true });
    expect(await service.changerDate("m", "2026-11-23")).toEqual({ ok: true });

    expect(changementsDeJour).toEqual([]);
  });

  it("serveur en UTC, mardi 24 choisi le vendredi 20 à 23 h 30 à Paris : rangé sous « Mardi 24 novembre », ni la veille ni le lendemain", async () => {
    // 23 h 30 à Paris = 22 h 30 UTC. Le jour choisi voyage en date de calendrier, pas en instant :
    // minuit à Paris (23 h UTC la veille) ne peut pas le faire glisser au 23.
    expect(new Date(VENDREDI_20_MIDI).getTimezoneOffset()).toBe(0);
    const VENDREDI_20_23H30 = Date.UTC(2026, 10, 20, 22, 30);
    const { repository, changementsDeJour } = fauxRepository(enBase);
    const service = createTodoService(repository);

    await service.changerDate("c", "2026-11-24");

    expect(changementsDeJour).toEqual([{ id: "c", jour: "2026-11-24" }]);
    const { jours } = composerRegistre(await service.lister(), VENDREDI_20_23H30);
    const mardi = jours.find((j) => j.todos.some((t) => t.id === "c"));
    expect(mardi).toMatchObject({ cle: "2026-11-24", titre: "Mardi 24 novembre" });
  });

  it("date vide ou invalide : rien n'est modifié et l'erreur dit que la date n'est pas valide", async () => {
    const { repository, changementsDeJour } = fauxRepository(enBase);
    const service = createTodoService(repository);

    for (const saisie of ["", undefined, "2026-02-30", "24/11/2026"]) {
      expect(await service.changerDate("c", saisie), String(saisie)).toEqual({ ok: false, erreur: "date-invalide" });
    }

    expect(changementsDeJour).toEqual([]);
    expect(await service.lister()).toEqual(enBase);
  });

  it("identifiant inconnu : rien n'est modifié et l'erreur dit que le TODO est introuvable", async () => {
    const { repository, changementsDeJour } = fauxRepository(enBase);
    const service = createTodoService(repository);

    expect(await service.changerDate("inconnu", "2026-11-16")).toEqual({ ok: false, erreur: "introuvable" });
    expect(await service.changerDate(undefined, "2026-11-16")).toEqual({ ok: false, erreur: "introuvable" });

    expect(changementsDeJour).toEqual([]);
    expect(await service.lister()).toEqual(enBase);
  });

  it("TODO terminé : sa date ne change pas (hors lot)", async () => {
    const depart = [{ ...enBase[0], termine: true }, ...enBase.slice(1)];
    const { repository, changementsDeJour } = fauxRepository(depart);
    const service = createTodoService(repository);

    expect(await service.changerDate("a", "2026-11-20")).toEqual({ ok: false, erreur: "deja-termine" });

    expect(changementsDeJour).toEqual([]);
  });
});
