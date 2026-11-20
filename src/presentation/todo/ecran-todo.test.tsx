// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

/** Durée de la chorégraphie quand on coche : trait d'encre puis repli de la ligne. */
const CHOREGRAPHIE = 600;

async function laisserPasser(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
}

/** Valeur d'une cellule du cartouche, dans le bandeau. */
function compteur(libelle: string): string | null | undefined {
  return within(screen.getByRole("banner")).getByText(libelle, { selector: "dt" }).nextElementSibling?.textContent;
}

function boutonTermines(): HTMLElement {
  return screen.getByRole("button", { name: /^Terminés/ });
}

/** Titres de la section « Terminés », en l'ouvrant si besoin. */
function lignesTerminees(): string[] {
  if (boutonTermines().getAttribute("aria-expanded") !== "true") fireEvent.click(boutonTermines());
  const liste = screen.getByRole("list", { name: "TODO terminés" });
  return within(liste)
    .getAllByRole("listitem")
    .map((li) => li.querySelector("[data-titre]")?.textContent ?? "");
}

const UN_TERMINE: Todo[] = [
  DEUX_JOURS[0],
  { ...DEUX_JOURS[1], termine: true },
  DEUX_JOURS[2],
];

describe("EcranTodo · marquer terminé", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("cocher un TODO en cours : affiché terminé tout de suite (case cochée, titre barré), enregistré ensuite", async () => {
    const { action } = actionEnSuspens<ResultatTerminer>(TERMINE);
    afficher(DEUX_JOURS, { terminerAction: action });
    expect(caseDe("Relancer le devis").getAttribute("aria-checked")).toBe("false");
    expect(estBarre("Relancer le devis")).toBe(false);

    fireEvent.click(caseDe("Relancer le devis"));

    expect(caseDe("Relancer le devis").getAttribute("aria-checked")).toBe("true");
    expect(estBarre("Relancer le devis")).toBe(true);
    expect(caseDe("Relire le contrat de maintenance").getAttribute("aria-checked")).toBe("false");
    expect(action).not.toHaveBeenCalled();

    await laisserPasser(CHOREGRAPHIE);

    expect(action.mock.calls).toEqual([["a"]]);
  });

  it("un TODO terminé en base s'affiche dans « Terminés », coché et barré", () => {
    afficher(UN_TERMINE);

    expect(lignesTerminees()).toEqual(["Relire le contrat de maintenance"]);
    expect(caseDe("Relire le contrat de maintenance").getAttribute("aria-checked")).toBe("true");
    expect(estBarre("Relire le contrat de maintenance")).toBe(true);
  });

  it("TODO déjà terminé : sa case ne se décoche pas et n'appelle pas le serveur", async () => {
    const terminerAction = vi.fn(ACTIONS_INERTES.terminerAction);
    afficher(UN_TERMINE, { terminerAction });
    lignesTerminees();

    expect(caseDe("Relire le contrat de maintenance").getAttribute("aria-readonly")).toBe("true");
    fireEvent.click(caseDe("Relire le contrat de maintenance"));
    await laisserPasser(CHOREGRAPHIE);

    expect(terminerAction).not.toHaveBeenCalled();
    expect(caseDe("Relire le contrat de maintenance").getAttribute("aria-checked")).toBe("true");
  });

  it("TODO introuvable en base : rien n'est modifié et un message le dit", async () => {
    const { action, liberer } = actionEnSuspens<ResultatTerminer>(TERMINE);
    afficher(DEUX_JOURS, { terminerAction: action });

    fireEvent.click(caseDe("Relancer le devis"));
    await laisserPasser(CHOREGRAPHIE);
    await act(async () => liberer({ ok: false, erreur: "introuvable" }));

    expect(screen.getByText("Ce TODO n'existe plus")).toBeDefined();
    expect(lignes("Lundi 16 novembre")).toEqual(["Relancer le devis", "Relire le contrat de maintenance"]);
    expect(caseDe("Relancer le devis").getAttribute("aria-checked")).toBe("false");
    expect(estBarre("Relancer le devis")).toBe(false);
    expect(compteur("En cours")).toBe("3");

    fireEvent.click(screen.getByRole("button", { name: "Fermer le message" }));
    expect(screen.queryByText("Ce TODO n'existe plus")).toBeNull();
  });

  it("annonce le TODO terminé", async () => {
    const { action, liberer } = actionEnSuspens<ResultatTerminer>(TERMINE);
    afficher(DEUX_JOURS, { terminerAction: action });

    fireEvent.click(caseDe("Relancer le devis"));
    await laisserPasser(CHOREGRAPHIE);
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

describe("EcranTodo · en cours et terminés", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("2 en cours et 1 terminé : les en cours en haut, le terminé dans « Terminés », compteur à 2", () => {
    afficher(UN_TERMINE);

    expect(lignes("Lundi 16 novembre")).toEqual(["Relancer le devis"]);
    expect(lignes("Aujourd'hui")).toEqual(["Sauvegarder la base de recette"]);
    expect(compteur("En cours")).toBe("2");
    expect(compteur("Terminés")).toBe("1");
    expect(boutonTermines().textContent).toContain("1");
    const derniereSection = screen.getByRole("region", { name: "Aujourd'hui" });
    expect(derniereSection.compareDocumentPosition(boutonTermines()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(lignesTerminees()).toEqual(["Relire le contrat de maintenance"]);
  });

  it("cocher un TODO en cours : il passe dans « Terminés » et le compteur baisse de 1", async () => {
    const { action } = actionEnSuspens<ResultatTerminer>(TERMINE);
    afficher(UN_TERMINE, { terminerAction: action });
    expect(compteur("En cours")).toBe("2");

    fireEvent.click(caseDe("Relancer le devis"));
    await laisserPasser(CHOREGRAPHIE);

    expect(compteur("En cours")).toBe("1");
    expect(compteur("Terminés")).toBe("2");
    expect(lignesTerminees()).toEqual(["Relancer le devis", "Relire le contrat de maintenance"]);
    expect(action).toHaveBeenCalledWith("a");
  });

  it("cocher le seul TODO en cours d'un jour : l'en-tête de ce jour disparaît", async () => {
    const { action } = actionEnSuspens<ResultatTerminer>(TERMINE);
    afficher(UN_TERMINE, { terminerAction: action });

    fireEvent.click(caseDe("Sauvegarder la base de recette"));
    await laisserPasser(CHOREGRAPHIE);

    expect(screen.queryByRole("region", { name: "Aujourd'hui" })).toBeNull();
    expect(screen.getByRole("region", { name: "Lundi 16 novembre" })).toBeDefined();
  });

  it("tous les TODO terminés : un message dit qu'il ne reste rien à faire", () => {
    afficher(DEUX_JOURS.map((t) => ({ ...t, termine: true })));

    expect(screen.getByRole("heading", { level: 2, name: "Rien à faire pour l'instant" })).toBeDefined();
    expect(screen.getByText(/Tes 3 TODO sont terminés/)).toBeDefined();
    expect(compteur("En cours")).toBe("0");
    expect(boutonTermines().getAttribute("aria-expanded")).toBe("true");
  });

  it("aucun TODO terminé : pas de section « Terminés »", () => {
    afficher(DEUX_JOURS);

    expect(screen.queryByRole("button", { name: /^Terminés/ })).toBeNull();
    expect(compteur("Terminés")).toBe("0");
  });

  it("le cartouche donne l'âge du plus ancien TODO en cours", () => {
    afficher(UN_TERMINE);

    expect(compteur("Le plus ancien")).toBe("4 j");
  });

  it("après avoir coché au clavier, le focus passe à la case suivante", async () => {
    const { action } = actionEnSuspens<ResultatTerminer>(TERMINE);
    afficher(DEUX_JOURS, { terminerAction: action });

    caseDe("Relancer le devis").focus();
    fireEvent.click(caseDe("Relancer le devis"));
    await laisserPasser(CHOREGRAPHIE);
    await act(async () => {
      await new Promise((resoudre) => requestAnimationFrame(() => resoudre(null)));
    });

    expect(document.activeElement).toBe(caseDe("Relire le contrat de maintenance"));
  });
});

describe("ChargementListe", () => {
  it("annonce le chargement de la liste", () => {
    render(<ChargementListe />);

    expect(screen.getByRole("status").textContent).toBe("Chargement de ta liste…");
  });
});
