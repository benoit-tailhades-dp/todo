import { describe, expect, it } from "vitest";
import { ageDuJour, cleJour, dateLongue, instantDuJour, precisionDuJour, titreDuJour, validerJour } from "./jours";

// Instants absolus. En novembre, Paris est à UTC + 1.
const JEUDI_19_23H30 = Date.UTC(2026, 10, 19, 22, 30);
const VENDREDI_20_0H30 = Date.UTC(2026, 10, 19, 23, 30);
const VENDREDI_20_MIDI = Date.UTC(2026, 10, 20, 11, 0);
const VENDREDI_20_23H30 = Date.UTC(2026, 10, 20, 22, 30);

describe("jours (heure de Paris)", () => {
  it("les tests tournent en UTC, comme le serveur Vercel", () => {
    expect(new Date(VENDREDI_20_MIDI).getTimezoneOffset()).toBe(0);
  });

  it("range un instant sous son jour à Paris, pas sous son jour UTC", () => {
    expect(cleJour(JEUDI_19_23H30)).toBe("2026-11-19");
    expect(cleJour(VENDREDI_20_0H30)).toBe("2026-11-20");
  });

  it("un jour donne un instant qui tombe ce jour-là à Paris", () => {
    expect(cleJour(instantDuJour("2026-11-24"))).toBe("2026-11-24");
    expect(cleJour(instantDuJour("2026-07-14"))).toBe("2026-07-14");
  });

  it("âge d'un jour, en jours calendaires à Paris : 0 aujourd'hui, 1 hier, −1 demain", () => {
    expect(ageDuJour("2026-11-20", VENDREDI_20_0H30)).toBe(0);
    expect(ageDuJour("2026-11-19", VENDREDI_20_0H30)).toBe(1);
    expect(ageDuJour("2026-11-16", VENDREDI_20_MIDI)).toBe(4);
    expect(ageDuJour("2026-11-21", VENDREDI_20_MIDI)).toBe(-1);
    expect(ageDuJour("2026-11-24", VENDREDI_20_23H30)).toBe(-4);
  });

  it("titre le jour : « Aujourd'hui », « Hier », « Demain », sinon la date", () => {
    expect(titreDuJour("2026-11-20", VENDREDI_20_0H30)).toBe("Aujourd'hui");
    expect(titreDuJour("2026-11-19", VENDREDI_20_MIDI)).toBe("Hier");
    expect(titreDuJour("2026-11-21", VENDREDI_20_MIDI)).toBe("Demain");
    expect(titreDuJour("2026-11-16", VENDREDI_20_MIDI)).toBe("Lundi 16 novembre");
    expect(titreDuJour("2026-11-24", VENDREDI_20_MIDI)).toBe("Mardi 24 novembre");
  });

  it("précise la date à côté de « Aujourd'hui », « Hier » et « Demain », pas pour les jours déjà datés", () => {
    expect(precisionDuJour("2026-11-20", VENDREDI_20_MIDI)).toBe("vendredi 20 novembre");
    expect(precisionDuJour("2026-11-19", VENDREDI_20_MIDI)).toBe("jeudi 19 novembre");
    expect(precisionDuJour("2026-11-21", VENDREDI_20_MIDI)).toBe("samedi 21 novembre");
    expect(precisionDuJour("2026-11-16", VENDREDI_20_MIDI)).toBeNull();
    expect(precisionDuJour("2026-11-24", VENDREDI_20_MIDI)).toBeNull();
  });

  it("écrit la date du jour en toutes lettres", () => {
    expect(dateLongue(VENDREDI_20_MIDI)).toBe("Vendredi 20 novembre");
  });
});

describe("validerJour", () => {
  it("un jour du calendrier, au format AAAA-MM-JJ : accepté tel quel", () => {
    expect(validerJour("2026-11-16")).toEqual({ ok: true, jour: "2026-11-16" });
    expect(validerJour("2028-02-29")).toEqual({ ok: true, jour: "2028-02-29" });
  });

  it("date vide, absente, d'un autre format ou qui n'existe pas : refusée", () => {
    for (const saisie of ["", "   ", undefined, null, 20261124, "24/11/2026", "2026-11-24T23:30", "2026-1-4", "2026-02-30", "2026-13-01", "2026-11-00"]) {
      expect(validerJour(saisie), String(saisie)).toEqual({ ok: false, erreur: "date-invalide" });
    }
  });
});
