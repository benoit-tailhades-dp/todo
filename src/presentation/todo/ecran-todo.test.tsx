// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { ResultatAjout, ResultatChangerDate, ResultatTerminer } from "@/service/todo-service";
import type { Todo } from "@/service/registre";
import { ChargementListe } from "./chargement-liste";
import { EcranTodo } from "./ecran-todo";

// Instants absolus. En novembre, Paris est à UTC + 1.
const VENDREDI_20_MIDI = Date.UTC(2026, 10, 20, 11, 0);
const VENDREDI_20_23H30 = Date.UTC(2026, 10, 20, 22, 30);

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
    (...argumentsRecus: string[]) =>
      new Promise<R>((resoudre) => {
        void argumentsRecus;
        liberer = resoudre;
        enSuspens.push(() => resoudre(parDefaut));
      }),
  );
  return { action, liberer: (resultat: R) => liberer(resultat) };
}

const AJOUT_REFUSE: ResultatAjout = { ok: false, erreur: "titre-vide" };
const TERMINE: ResultatTerminer = { ok: true };
const DATE_CHANGEE: ResultatChangerDate = { ok: true };

type Actions = {
  ajouterAction: (saisie: string) => Promise<ResultatAjout>;
  terminerAction: (id: string) => Promise<ResultatTerminer>;
  changerDateAction: (id: string, jour: string) => Promise<ResultatChangerDate>;
};

const ACTIONS_INERTES: Actions = {
  ajouterAction: async () => ({ ok: false, erreur: "titre-vide" }),
  terminerAction: async () => ({ ok: true }),
  changerDateAction: async () => ({ ok: true }),
};

function ecran(todos: Todo[], actions: Partial<Actions> = {}, maintenant = VENDREDI_20_MIDI) {
  return <EcranTodo todos={todos} maintenant={maintenant} {...ACTIONS_INERTES} {...actions} />;
}

function afficher(todos: Todo[], actions: Partial<Actions> = {}, maintenant = VENDREDI_20_MIDI) {
  return render(ecran(todos, actions, maintenant));
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

  it("le bandeau porte le sélecteur de thème, qui annonce le thème actif", () => {
    afficher([]);

    const theme = within(screen.getByRole("banner")).getByRole("radiogroup", { name: "Thème" });
    expect(within(theme).getByRole("radio", { name: "Système" }).getAttribute("aria-checked")).toBe("true");
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
  // La ligne en attente est datée de l'heure de l'ajout : on fige l'horloge au jour de l'écran.
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(VENDREDI_20_MIDI);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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

/** Un TODO en cours auquel on a choisi un autre jour que son jour d'ajout. */
function deplace(id: string, titre: string, creeLe: number, jour: string): Todo {
  return { ...todo(id, titre, creeLe), jour };
}

const QUATRE: Todo[] = [...DEUX_JOURS, todo("d", "Préparer l'ordre du jour", Date.UTC(2026, 10, 20, 9, 0))];

const HIER_ET_AUJOURDHUI: Todo[] = [
  todo("h", "Commander les badges", Date.UTC(2026, 10, 19, 9, 0)),
  todo("c", "Sauvegarder la base de recette", Date.UTC(2026, 10, 20, 8, 0)),
];

function titresDesJours(): string[] {
  return screen.getAllByRole("heading", { level: 2 }).map((titre) => titre.textContent ?? "");
}

function boutonDate(titre: string): HTMLElement {
  return within(ligne(titre)).getByRole("button", { name: `Changer la date de « ${titre} »` });
}

function selecteur(): HTMLElement {
  return screen.getByRole("dialog", { name: "Changer la date" });
}

function ouvrirSelecteur(titre: string): HTMLElement {
  fireEvent.click(boutonDate(titre));
  return selecteur();
}

/** Choisit un jour dans le calendrier ouvert ; le nom suit le format « lundi 16 novembre 2026 ». */
function choisirJour(nom: string) {
  fireEvent.click(within(selecteur()).getByRole("button", { name: new RegExp(nom) }));
}

/** Le `DataTransfer` d'un glisser-déposer, que jsdom ne fournit pas. */
function transfert() {
  const donnees = new Map<string, string>();
  return {
    effectAllowed: "uninitialized",
    dropEffect: "none",
    setData: (type: string, valeur: string) => void donnees.set(type, valeur),
    getData: (type: string) => donnees.get(type) ?? "",
  };
}

function jour(nom: string): HTMLElement {
  return screen.getByRole("region", { name: nom });
}

async function prochaineImage() {
  await act(async () => {
    await new Promise((resoudre) => requestAnimationFrame(() => resoudre(null)));
  });
}

describe("EcranTodo · changer la date avec le sélecteur", () => {
  it("TODO d'aujourd'hui, lundi 16 choisi : il passe sous « Lundi 16 novembre » et les compteurs des deux jours changent", async () => {
    const { action, liberer } = actionEnSuspens<ResultatChangerDate>(DATE_CHANGEE);
    const { rerender } = afficher(QUATRE, { changerDateAction: action });
    expect(cellule(jour("Lundi 16 novembre"), "TODO")).toBe("2");
    expect(cellule(jour("Aujourd'hui"), "TODO")).toBe("2");

    ouvrirSelecteur("Sauvegarder la base de recette");
    choisirJour("lundi 16 novembre 2026");

    expect(action.mock.calls).toEqual([["c", "2026-11-16"]]);
    expect(screen.queryByRole("dialog", { name: "Changer la date" })).toBeNull();
    expect(lignes("Lundi 16 novembre")).toEqual([
      "Relancer le devis",
      "Relire le contrat de maintenance",
      "Sauvegarder la base de recette",
    ]);
    expect(lignes("Aujourd'hui")).toEqual(["Préparer l'ordre du jour"]);
    expect(cellule(jour("Lundi 16 novembre"), "TODO")).toBe("3");
    expect(cellule(jour("Aujourd'hui"), "TODO")).toBe("1");

    // Le serveur répond, puis la page se recharge avec la base (refresh()).
    await act(async () => liberer({ ok: true }));
    const enBase = QUATRE.map((t) => (t.id === "c" ? { ...t, jour: "2026-11-16" } : t));
    rerender(ecran(enBase, { changerDateAction: action }));

    expect(lignes("Lundi 16 novembre")).toHaveLength(3);
    expect(screen.getByText("« Sauvegarder la base de recette » déplacé sous Lundi 16 novembre.")).toBeDefined();
  });

  it("samedi 21 pour l'un, mardi 24 pour l'autre : rangés après « Aujourd'hui », sous « Demain » puis « Mardi 24 novembre »", () => {
    const { action } = actionEnSuspens<ResultatChangerDate>(DATE_CHANGEE);
    afficher(DEUX_JOURS, { changerDateAction: action });

    ouvrirSelecteur("Relancer le devis");
    choisirJour("samedi 21 novembre 2026");
    ouvrirSelecteur("Relire le contrat de maintenance");
    choisirJour("mardi 24 novembre 2026");

    expect(action.mock.calls).toEqual([
      ["a", "2026-11-21"],
      ["b", "2026-11-24"],
    ]);
    expect(titresDesJours()).toEqual(["Aujourd'hui", "Demain", "Mardi 24 novembre"]);
    expect(lignes("Demain")).toEqual(["Relancer le devis"]);
    expect(lignes("Mardi 24 novembre")).toEqual(["Relire le contrat de maintenance"]);
    expect(within(jour("Demain")).getByText("samedi 21 novembre")).toBeDefined();
    expect(cellule(jour("Demain"), "Dans")).toContain("1 j");
  });

  it("le seul TODO d'un jour déplacé : l'en-tête du jour qu'il quitte disparaît", () => {
    const { action } = actionEnSuspens<ResultatChangerDate>(DATE_CHANGEE);
    afficher(DEUX_JOURS, { changerDateAction: action });

    ouvrirSelecteur("Sauvegarder la base de recette");
    choisirJour("lundi 16 novembre 2026");

    expect(titresDesJours()).toEqual(["Lundi 16 novembre"]);
  });

  it("son propre jour choisi : il reste à sa place et rien n'est enregistré", () => {
    const changerDateAction = vi.fn(ACTIONS_INERTES.changerDateAction);
    afficher(DEUX_JOURS, { changerDateAction });

    ouvrirSelecteur("Relancer le devis");
    choisirJour("lundi 16 novembre 2026");

    expect(changerDateAction).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog", { name: "Changer la date" })).toBeNull();
    expect(lignes("Lundi 16 novembre")).toEqual(["Relancer le devis", "Relire le contrat de maintenance"]);
  });

  it("serveur et navigateur en UTC, mardi 24 choisi le vendredi 20 à 23 h 30 à Paris : envoyé « 2026-11-24 », rangé sous « Mardi 24 novembre »", () => {
    expect(new Date(VENDREDI_20_23H30).getTimezoneOffset()).toBe(0);
    const { action } = actionEnSuspens<ResultatChangerDate>(DATE_CHANGEE);
    afficher(DEUX_JOURS, { changerDateAction: action }, VENDREDI_20_23H30);

    ouvrirSelecteur("Sauvegarder la base de recette");
    choisirJour("mardi 24 novembre 2026");

    expect(action.mock.calls).toEqual([["c", "2026-11-24"]]);
    expect(lignes("Mardi 24 novembre")).toEqual(["Sauvegarder la base de recette"]);
  });

  it("le calendrier s'ouvre sur le jour du TODO, sélectionné et qui a le focus", async () => {
    afficher(DEUX_JOURS);

    ouvrirSelecteur("Relancer le devis");
    await prochaineImage();

    const selectionne = within(selecteur()).getByRole("button", { name: /lundi 16 novembre 2026, sélectionné/ });
    expect(document.activeElement).toBe(selectionne);
    expect(within(selecteur()).getByText("Relancer le devis")).toBeDefined();
  });

  it("au clavier : après le choix, le focus revient au bouton de date du TODO, sous son nouveau jour", async () => {
    const { action } = actionEnSuspens<ResultatChangerDate>(DATE_CHANGEE);
    afficher(DEUX_JOURS, { changerDateAction: action });

    ouvrirSelecteur("Sauvegarder la base de recette");
    choisirJour("lundi 16 novembre 2026");
    await prochaineImage();

    expect(document.activeElement).toBe(boutonDate("Sauvegarder la base de recette"));
    expect(jour("Lundi 16 novembre").contains(document.activeElement)).toBe(true);
  });

  it("« Le plus ancien » suit le jour affiché : « — » s'il ne reste que des jours à venir", () => {
    const { action } = actionEnSuspens<ResultatChangerDate>(DATE_CHANGEE);
    afficher([deplace("a", "Relancer le devis", Date.UTC(2026, 10, 16, 9, 0), "2026-11-21")], {
      changerDateAction: action,
    });

    expect(compteur("Le plus ancien")).toBe("—");
  });

  it("date refusée par le serveur : le TODO revient sous son jour et un message dit pourquoi", async () => {
    const { action, liberer } = actionEnSuspens<ResultatChangerDate>(DATE_CHANGEE);
    afficher(DEUX_JOURS, { changerDateAction: action });

    ouvrirSelecteur("Sauvegarder la base de recette");
    choisirJour("mardi 24 novembre 2026");
    await act(async () => liberer({ ok: false, erreur: "date-invalide" }));

    expect(screen.getByText("Cette date n'est pas valide")).toBeDefined();
    expect(lignes("Aujourd'hui")).toEqual(["Sauvegarder la base de recette"]);
    expect(screen.queryByRole("region", { name: "Mardi 24 novembre" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Fermer le message" }));
    expect(screen.queryByText("Cette date n'est pas valide")).toBeNull();
  });

  it("TODO introuvable en base : rien n'est modifié et un message le dit", async () => {
    const { action, liberer } = actionEnSuspens<ResultatChangerDate>(DATE_CHANGEE);
    afficher(DEUX_JOURS, { changerDateAction: action });

    ouvrirSelecteur("Sauvegarder la base de recette");
    choisirJour("lundi 16 novembre 2026");
    await act(async () => liberer({ ok: false, erreur: "introuvable" }));

    expect(screen.getByText("Ce TODO n'existe plus")).toBeDefined();
    expect(lignes("Aujourd'hui")).toEqual(["Sauvegarder la base de recette"]);
  });

  it("un TODO terminé ou en cours d'enregistrement n'a pas de sélecteur de date", () => {
    const { action } = actionEnSuspens<ResultatAjout>(AJOUT_REFUSE);
    afficher(UN_TERMINE, { ajouterAction: action });
    saisir("Préparer l'ordre du jour");
    fireEvent.submit(formulaire());
    lignesTerminees();

    expect(within(ligne("Relire le contrat de maintenance")).queryByRole("button")).toBeNull();
    expect(within(ligne("Préparer l'ordre du jour")).queryByRole("button")).toBeNull();
    expect(ligne("Préparer l'ordre du jour").getAttribute("draggable")).not.toBe("true");
  });
});

describe("EcranTodo · glisser-déposer", () => {
  it("TODO glissé de « Hier » et déposé sur « Aujourd'hui » : il passe sous « Aujourd'hui » avec la date du jour", () => {
    const { action } = actionEnSuspens<ResultatChangerDate>(DATE_CHANGEE);
    afficher(HIER_ET_AUJOURDHUI, { changerDateAction: action });
    const donnees = transfert();

    expect(ligne("Commander les badges").getAttribute("draggable")).toBe("true");
    fireEvent.dragStart(ligne("Commander les badges"), { dataTransfer: donnees });
    expect(ligne("Commander les badges").hasAttribute("data-glisse")).toBe(true);

    const accepte = !fireEvent.dragOver(screen.getByRole("heading", { name: "Aujourd'hui" }), { dataTransfer: donnees });
    expect(accepte).toBe(true);
    expect(jour("Aujourd'hui").hasAttribute("data-survole")).toBe(true);
    expect(within(jour("Aujourd'hui")).getByText("Déposer ici")).toBeDefined();

    fireEvent.drop(screen.getByRole("heading", { name: "Aujourd'hui" }), { dataTransfer: donnees });
    fireEvent.dragEnd(ligne("Commander les badges"), { dataTransfer: donnees });

    expect(action.mock.calls).toEqual([["h", "2026-11-20"]]);
    expect(titresDesJours()).toEqual(["Aujourd'hui"]);
    expect(lignes("Aujourd'hui")).toEqual(["Commander les badges", "Sauvegarder la base de recette"]);
    expect(screen.queryByText("Déposer ici")).toBeNull();
  });

  it("relâché sur son propre jour : le jour le refuse, il reste à sa place et rien n'est enregistré", () => {
    const changerDateAction = vi.fn(ACTIONS_INERTES.changerDateAction);
    afficher(HIER_ET_AUJOURDHUI, { changerDateAction });
    const donnees = transfert();

    fireEvent.dragStart(ligne("Commander les badges"), { dataTransfer: donnees });
    const accepte = !fireEvent.dragOver(screen.getByRole("heading", { name: "Hier" }), { dataTransfer: donnees });
    fireEvent.drop(screen.getByRole("heading", { name: "Hier" }), { dataTransfer: donnees });
    fireEvent.dragEnd(ligne("Commander les badges"), { dataTransfer: donnees });

    expect(accepte).toBe(false);
    expect(screen.queryByText("Déposer ici")).toBeNull();
    expect(changerDateAction).not.toHaveBeenCalled();
    expect(lignes("Hier")).toEqual(["Commander les badges"]);
  });

  it("relâché hors de la liste : il reste à sa place et rien n'est enregistré", () => {
    const changerDateAction = vi.fn(ACTIONS_INERTES.changerDateAction);
    afficher(HIER_ET_AUJOURDHUI, { changerDateAction });
    const donnees = transfert();

    fireEvent.dragStart(ligne("Commander les badges"), { dataTransfer: donnees });
    fireEvent.dragOver(screen.getByRole("heading", { name: "Aujourd'hui" }), { dataTransfer: donnees });
    fireEvent.dragLeave(jour("Aujourd'hui"), { dataTransfer: donnees, relatedTarget: document.body });
    fireEvent.dragEnd(ligne("Commander les badges"), { dataTransfer: donnees });

    expect(changerDateAction).not.toHaveBeenCalled();
    expect(jour("Aujourd'hui").hasAttribute("data-survole")).toBe(false);
    expect(ligne("Commander les badges").hasAttribute("data-glisse")).toBe(false);
    expect(lignes("Hier")).toEqual(["Commander les badges"]);
  });
});

describe("ChargementListe", () => {
  it("annonce le chargement de la liste", () => {
    render(<ChargementListe />);

    expect(screen.getByRole("status").textContent).toBe("Chargement de ta liste…");
  });

  it("le thème se choisit déjà pendant le chargement : le bandeau porte le sélecteur", () => {
    render(<ChargementListe />);

    expect(within(screen.getByRole("banner")).getByRole("radiogroup", { name: "Thème" })).toBeDefined();
  });
});

/** Un doigt pose, glisse horizontalement de `dx` pixels, puis se lève, sur la ligne d'un TODO. */
function glisserAuDoigt(titre: string, dx: number, pointerType = "touch") {
  const zone = ligne(titre).querySelector<HTMLElement>("[data-zone-geste]");
  if (!zone) throw new Error(`Pas de zone de geste sur « ${titre} »`);
  const commun = { pointerId: 1, pointerType, isPrimary: true, clientY: 100 };
  fireEvent.pointerDown(zone, { ...commun, clientX: 150 });
  fireEvent.pointerMove(zone, { ...commun, clientX: 150 + dx / 2 });
  fireEvent.pointerMove(zone, { ...commun, clientX: 150 + dx });
  fireEvent.pointerUp(zone, { ...commun, clientX: 150 + dx });
}

describe("EcranTodo · gestes au doigt", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("glisser une ligne vers la droite au-delà du seuil la termine, comme cocher sa case", async () => {
    const { action } = actionEnSuspens<ResultatTerminer>(TERMINE);
    afficher(DEUX_JOURS, { terminerAction: action });

    glisserAuDoigt("Relancer le devis", 140);

    expect(caseDe("Relancer le devis").getAttribute("aria-checked")).toBe("true");
    expect(estBarre("Relancer le devis")).toBe(true);
    await laisserPasser(CHOREGRAPHIE);
    expect(action.mock.calls).toEqual([["a"]]);
  });

  it("un glissement trop court ne fait rien : la ligne revient à sa place", async () => {
    const terminerAction = vi.fn(ACTIONS_INERTES.terminerAction);
    afficher(DEUX_JOURS, { terminerAction });

    glisserAuDoigt("Relancer le devis", 60);
    await laisserPasser(CHOREGRAPHIE);

    expect(caseDe("Relancer le devis").getAttribute("aria-checked")).toBe("false");
    expect(terminerAction).not.toHaveBeenCalled();
  });

  it("à la souris, la ligne ne se glisse pas de côté (la souris garde le glisser-déposer vers un jour)", async () => {
    const terminerAction = vi.fn(ACTIONS_INERTES.terminerAction);
    afficher(DEUX_JOURS, { terminerAction });

    glisserAuDoigt("Relancer le devis", 140, "mouse");
    await laisserPasser(CHOREGRAPHIE);

    expect(terminerAction).not.toHaveBeenCalled();
  });

  it("glisser une ligne vers la gauche au-delà du seuil ouvre son calendrier", async () => {
    afficher(DEUX_JOURS);

    glisserAuDoigt("Sauvegarder la base de recette", -140);
    await laisserPasser(400);

    expect(within(selecteur()).getByText("Sauvegarder la base de recette")).toBeDefined();
  });
});
