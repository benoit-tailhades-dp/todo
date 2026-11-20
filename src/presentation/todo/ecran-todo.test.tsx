// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { ResultatAjout, ResultatTerminer } from "@/service/todo-service";
import type { Todo } from "@/service/registre";
import { ChargementListe } from "./chargement-liste";
import { EcranTodo } from "./ecran-todo";

// Instants absolus. En novembre, Paris est à UTC + 1.
const VENDREDI_20_MIDI = Date.UTC(2026, 10, 20, 11, 0);

function todo(id: string, titre: string, creeLe: number): Todo {
  return { id, titre, creeLe, termine: false };
}

const DEUX_JOURS: Todo[] = [
  todo("a", "Relancer le devis", Date.UTC(2026, 10, 16, 9, 0)),
  todo("b", "Relire le contrat de maintenance", Date.UTC(2026, 10, 16, 15, 0)),
  todo("c", "Sauvegarder la base de recette", Date.UTC(2026, 10, 20, 8, 0)),
];

/**
 * Réponses du serveur encore attendues. React lie entre elles toutes les transitions asynchrones en cours :
 * une action jamais libérée bloquerait les tests suivants. Chaque test libère les siennes en sortant.
 */
const enSuspens: Array<() => void> = [];

/** Action serveur qui attend qu'on la libère : on voit l'écran pendant et après l'enregistrement. */
function actionEnSuspens<R>(parDefaut: R) {
  let liberer: (resultat: R) => void = () => {};
  const action = vi.fn(
    (argument: string) =>
      new Promise<R>((resoudre) => {
        void argument;
        liberer = resoudre;
        enSuspens.push(() => resoudre(parDefaut));
      }),
  );
  return { action, liberer: (resultat: R) => liberer(resultat) };
}

const AJOUT_REFUSE: ResultatAjout = { ok: false, erreur: "titre-vide" };
const TERMINE: ResultatTerminer = { ok: true };

type Actions = {
  ajouterAction: (saisie: string) => Promise<ResultatAjout>;
  terminerAction: (id: string) => Promise<ResultatTerminer>;
};

const ACTIONS_INERTES: Actions = {
  ajouterAction: async () => ({ ok: false, erreur: "titre-vide" }),
  terminerAction: async () => ({ ok: true }),
};

function ecran(todos: Todo[], actions: Partial<Actions> = {}) {
  return <EcranTodo todos={todos} maintenant={VENDREDI_20_MIDI} {...ACTIONS_INERTES} {...actions} />;
}

function afficher(todos: Todo[], actions: Partial<Actions> = {}) {
  return render(ecran(todos, actions));
}

/** Valeur d'une cellule d'en-tête de jour (« Âge », « TODO »). */
function cellule(section: HTMLElement, libelle: string): string | null | undefined {
  return within(section).getByText(libelle, { selector: "dt" }).nextElementSibling?.textContent;
}

function champ(): HTMLInputElement {
  return screen.getByRole("textbox", { name: "Nouveau TODO" });
}

/** Le formulaire du champ : l'envoyer revient à appuyer sur Entrée dans le champ. */
function formulaire(): HTMLFormElement {
  const form = champ().form;
  if (!form) throw new Error("Le champ n'est pas dans un formulaire");
  return form;
}

function saisir(valeur: string) {
  fireEvent.change(champ(), { target: { value: valeur } });
}

/** Titres des TODO d'une section de jour, dans l'ordre affiché. */
function lignes(nomDuJour: string): string[] {
  const section = screen.getByRole("region", { name: nomDuJour });
  return within(section)
    .getAllByRole("listitem")
    .map((ligne) => ligne.querySelector("[data-titre]")?.textContent ?? "");
}

afterEach(async () => {
  cleanup();
  await act(async () => enSuspens.splice(0).forEach((liberer) => liberer()));
});

describe("EcranTodo · consulter", () => {
  it("affiche le bandeau : « Mes TODO » et la date du jour", () => {
    afficher([]);

    expect(screen.getByRole("heading", { level: 1, name: "Mes TODO" })).toBeDefined();
    expect(screen.getByText("Vendredi 20 novembre")).toBeDefined();
  });

  it("base sans TODO : affiche « Aucun TODO pour l'instant »", () => {
    afficher([]);

    expect(screen.getByRole("heading", { level: 2, name: "Aucun TODO pour l'instant" })).toBeDefined();
    expect(screen.queryByRole("listitem")).toBeNull();
  });

  it("affiche un en-tête par jour, du plus ancien au plus récent, chacun avec son nombre de TODO", () => {
    afficher(DEUX_JOURS);

    const titres = screen.getAllByRole("heading", { level: 2 }).map((titre) => titre.textContent);
    expect(titres).toEqual(["Lundi 16 novembre", "Aujourd'hui"]);
    expect(cellule(screen.getByRole("region", { name: "Lundi 16 novembre" }), "TODO")).toBe("2");
    expect(cellule(screen.getByRole("region", { name: "Aujourd'hui" }), "TODO")).toBe("1");
    expect(screen.queryByText("Aucun TODO pour l'instant")).toBeNull();
  });

  it("affiche les TODO de chaque jour du plus ancien au plus récent", () => {
    afficher(DEUX_JOURS);

    expect(lignes("Lundi 16 novembre")).toEqual(["Relancer le devis", "Relire le contrat de maintenance"]);
    expect(lignes("Aujourd'hui")).toEqual(["Sauvegarder la base de recette"]);
  });

  it("précise la date à côté de « Aujourd'hui » et donne l'âge de chaque jour", () => {
    afficher(DEUX_JOURS);

    const aujourdhui = screen.getByRole("region", { name: "Aujourd'hui" });
    expect(within(aujourdhui).getByText("vendredi 20 novembre")).toBeDefined();
    expect(cellule(screen.getByRole("region", { name: "Lundi 16 novembre" }), "Âge")).toContain("4 j");
  });
});

describe("EcranTodo · ajouter", () => {
  it("valide « Relancer le devis » : champ vidé, ligne en attente en dernier sous « Aujourd'hui », puis enregistrée", async () => {
    const { action, liberer } = actionEnSuspens<ResultatAjout>(AJOUT_REFUSE);
    const { rerender } = afficher(DEUX_JOURS, { ajouterAction: action });

    saisir("Relancer le devis");
    fireEvent.click(screen.getByRole("button", { name: "Ajouter" }));

    expect(action).toHaveBeenCalledWith("Relancer le devis");
    expect(champ().value).toBe("");
    expect(lignes("Aujourd'hui")).toEqual(["Sauvegarder la base de recette", "Relancer le devis"]);
    expect(screen.getByText("Enregistrement…")).toBeDefined();

    // Le serveur répond, puis la page se recharge avec la base (refresh()).
    const enregistre = todo("d", "Relancer le devis", VENDREDI_20_MIDI);
    await act(async () => liberer({ ok: true, todo: enregistre }));
    rerender(ecran([...DEUX_JOURS, enregistre], { ajouterAction: action }));

    expect(lignes("Aujourd'hui")).toEqual(["Sauvegarder la base de recette", "Relancer le devis"]);
    expect(screen.queryByText("Enregistrement…")).toBeNull();
    expect(screen.getByText("à l'instant")).toBeDefined();
    expect(screen.getByText("« Relancer le devis » ajouté sous Aujourd'hui.")).toBeDefined();
  });

  it("valide avec Entrée (envoi du formulaire)", () => {
    const { action } = actionEnSuspens<ResultatAjout>(AJOUT_REFUSE);
    afficher(DEUX_JOURS, { ajouterAction: action });

    saisir("Relancer le devis");
    fireEvent.submit(formulaire());

    expect(action).toHaveBeenCalledWith("Relancer le devis");
    expect(champ().value).toBe("");
  });

  it("sans TODO du jour, crée l'en-tête « Aujourd'hui » pour le nouveau TODO", () => {
    const { action } = actionEnSuspens<ResultatAjout>(AJOUT_REFUSE);
    afficher(DEUX_JOURS.slice(0, 2), { ajouterAction: action });

    saisir("Relancer le devis");
    fireEvent.submit(formulaire());

    const titres = screen.getAllByRole("heading", { level: 2 }).map((titre) => titre.textContent);
    expect(titres).toEqual(["Lundi 16 novembre", "Aujourd'hui"]);
    expect(lignes("Aujourd'hui")).toEqual(["Relancer le devis"]);
  });

  it("champ vide ou fait d'espaces : aucun ajout, un message demande un titre", () => {
    const { action } = actionEnSuspens<ResultatAjout>(AJOUT_REFUSE);
    afficher(DEUX_JOURS, { ajouterAction: action });

    fireEvent.submit(formulaire());
    expect(screen.getByRole("alert").textContent).toBe("Écris un titre avant d'ajouter.");

    saisir("   ");
    fireEvent.submit(formulaire());

    expect(action).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toBe("Écris un titre avant d'ajouter.");
    expect(lignes("Aujourd'hui")).toEqual(["Sauvegarder la base de recette"]);
    expect(champ().getAttribute("aria-invalid")).toBe("true");
  });

  it("titre entouré d'espaces : la ligne affiche le titre sans les espaces", () => {
    const { action } = actionEnSuspens<ResultatAjout>(AJOUT_REFUSE);
    afficher(DEUX_JOURS, { ajouterAction: action });

    saisir("  Relancer le devis  ");
    fireEvent.submit(formulaire());

    expect(lignes("Aujourd'hui")).toEqual(["Sauvegarder la base de recette", "Relancer le devis"]);
  });

  it("Échap vide le champ", () => {
    afficher(DEUX_JOURS);

    saisir("Relancer le devis");
    fireEvent.keyDown(champ(), { key: "Escape" });

    expect(champ().value).toBe("");
  });
});

/** La ligne d'un TODO, retrouvée par son titre. */
function ligne(titre: string): HTMLElement {
  const trouvee = screen
    .getAllByRole("listitem")
    .find((li) => li.querySelector("[data-titre]")?.textContent === titre);
  if (!trouvee) throw new Error(`Pas de ligne « ${titre} »`);
  return trouvee;
}

function caseDe(titre: string): HTMLElement {
  return within(ligne(titre)).getByRole("checkbox");
}

function estBarre(titre: string): boolean {
  return ligne(titre).querySelector("[data-barre]")?.getAttribute("data-barre") === "true";
}

describe("EcranTodo · marquer terminé", () => {
  it("cocher un TODO en cours : affiché terminé tout de suite (case cochée, titre barré)", () => {
    const { action } = actionEnSuspens<ResultatTerminer>(TERMINE);
    afficher(DEUX_JOURS, { terminerAction: action });
    expect(caseDe("Relancer le devis").getAttribute("aria-checked")).toBe("false");
    expect(estBarre("Relancer le devis")).toBe(false);

    fireEvent.click(caseDe("Relancer le devis"));

    expect(action.mock.calls).toEqual([["a"]]);
    expect(caseDe("Relancer le devis").getAttribute("aria-checked")).toBe("true");
    expect(estBarre("Relancer le devis")).toBe(true);
    expect(caseDe("Relire le contrat de maintenance").getAttribute("aria-checked")).toBe("false");
  });

  it("un TODO terminé en base s'affiche coché et barré", () => {
    afficher([{ ...DEUX_JOURS[0], termine: true }, DEUX_JOURS[1]]);

    expect(caseDe("Relancer le devis").getAttribute("aria-checked")).toBe("true");
    expect(estBarre("Relancer le devis")).toBe(true);
  });

  it("TODO déjà terminé : sa case ne se décoche pas et n'appelle pas le serveur", () => {
    const terminerAction = vi.fn(ACTIONS_INERTES.terminerAction);
    afficher([{ ...DEUX_JOURS[0], termine: true }, DEUX_JOURS[1]], { terminerAction });

    expect(caseDe("Relancer le devis").getAttribute("aria-readonly")).toBe("true");
    fireEvent.click(caseDe("Relancer le devis"));

    expect(terminerAction).not.toHaveBeenCalled();
    expect(caseDe("Relancer le devis").getAttribute("aria-checked")).toBe("true");
  });

  it("TODO introuvable en base : rien n'est modifié et un message le dit", async () => {
    const { action, liberer } = actionEnSuspens<ResultatTerminer>(TERMINE);
    afficher(DEUX_JOURS, { terminerAction: action });

    fireEvent.click(caseDe("Relancer le devis"));
    await act(async () => liberer({ ok: false, erreur: "introuvable" }));

    expect(screen.getByText("Ce TODO n'existe plus")).toBeDefined();
    expect(caseDe("Relancer le devis").getAttribute("aria-checked")).toBe("false");
    expect(estBarre("Relancer le devis")).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Fermer le message" }));
    expect(screen.queryByText("Ce TODO n'existe plus")).toBeNull();
  });

  it("annonce le TODO terminé", async () => {
    const { action, liberer } = actionEnSuspens<ResultatTerminer>(TERMINE);
    afficher(DEUX_JOURS, { terminerAction: action });

    fireEvent.click(caseDe("Relancer le devis"));
    await act(async () => liberer({ ok: true }));

    expect(screen.getByText("« Relancer le devis » terminé.")).toBeDefined();
  });

  it("une ligne en cours d'enregistrement n'a pas de case", () => {
    const { action } = actionEnSuspens<ResultatAjout>(AJOUT_REFUSE);
    afficher(DEUX_JOURS, { ajouterAction: action });

    saisir("Préparer l'ordre du jour");
    fireEvent.submit(formulaire());

    expect(within(ligne("Préparer l'ordre du jour")).queryByRole("checkbox")).toBeNull();
  });
});

describe("ChargementListe", () => {
  it("annonce le chargement de la liste", () => {
    render(<ChargementListe />);

    expect(screen.getByRole("status").textContent).toBe("Chargement de ta liste…");
  });
});
