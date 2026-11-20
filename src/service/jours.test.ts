import { describe, expect, it } from "vitest";
import { cleJour, dateLongue, ecartJours, precisionDuJour, titreDuJour } from "./jours";

// Instants absolus. En novembre, Paris est à UTC + 1.
const LUNDI_16_10H = Date.UTC(2026, 10, 16, 9, 0);
const JEUDI_19_23H30 = Date.UTC(2026, 10, 19, 22, 30);
const VENDREDI_20_0H30 = Date.UTC(2026, 10, 19, 23, 30);
const VENDREDI_20_MIDI = Date.UTC(2026, 10, 20, 11, 0);

describe("jours (heure de Paris)", () => {
  it("les tests tournent en UTC, comme le serveur Vercel", () => {
    expect(new Date(VENDREDI_20_MIDI).getTimezoneOffset()).toBe(0);
  });

  it("range un instant sous son jour à Paris, pas sous son jour UTC", () => {
    expect(cleJour(JEUDI_19_23H30)).toBe("2026-11-19");
    expect(cleJour(VENDREDI_20_0H30)).toBe("2026-11-20");
  });

  it("compte les jours calendaires à Paris", () => {
    expect(ecartJours(VENDREDI_20_0H30, VENDREDI_20_MIDI)).toBe(0);
    expect(ecartJours(JEUDI_19_23H30, VENDREDI_20_0H30)).toBe(1);
    expect(ecartJours(LUNDI_16_10H, VENDREDI_20_MIDI)).toBe(4);
  });

  it("titre le jour : « Aujourd'hui », « Hier », sinon la date", () => {
    expect(titreDuJour(VENDREDI_20_0H30, VENDREDI_20_MIDI)).toBe("Aujourd'hui");
    expect(titreDuJour(JEUDI_19_23H30, VENDREDI_20_MIDI)).toBe("Hier");
    expect(titreDuJour(LUNDI_16_10H, VENDREDI_20_MIDI)).toBe("Lundi 16 novembre");
  });

  it("précise la date à côté de « Aujourd'hui » et « Hier », pas pour les jours déjà datés", () => {
    expect(precisionDuJour(VENDREDI_20_0H30, VENDREDI_20_MIDI)).toBe("vendredi 20 novembre");
    expect(precisionDuJour(JEUDI_19_23H30, VENDREDI_20_MIDI)).toBe("jeudi 19 novembre");
    expect(precisionDuJour(LUNDI_16_10H, VENDREDI_20_MIDI)).toBeNull();
  });

  it("écrit la date du jour en toutes lettres", () => {
    expect(dateLongue(VENDREDI_20_MIDI)).toBe("Vendredi 20 novembre");
  });
});
