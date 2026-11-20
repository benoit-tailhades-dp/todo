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
  };
  return { repository, ajouts, terminaisons };
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
