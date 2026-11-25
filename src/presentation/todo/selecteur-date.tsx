"use client";

import { CalendarDays } from "lucide-react";
import { useRef } from "react";
import { fr } from "react-day-picker/locale";
import { Button } from "@/presentation/ui/button";
import { Calendar } from "@/presentation/ui/calendar";
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@/presentation/ui/popover";
import { cleJour, FUSEAU, instantDuJour } from "@/service/jours";

/**
 * Bouton calendrier d'un TODO en cours : choisir un autre jour, passé ou futur, le range sous ce jour.
 * Au clavier, il fait le travail du glisser-déposer. Le calendrier compte les jours à l'heure de Paris.
 */
export function SelecteurDate({
  titre,
  jour,
  maintenant,
  ouvert,
  onOuvertChange,
  onChoisir,
}: {
  titre: string;
  /** Jour actuel du TODO, AAAA-MM-JJ. */
  jour: string;
  maintenant: number;
  ouvert: boolean;
  onOuvertChange: (ouvert: boolean) => void;
  /** Le jour choisi, AAAA-MM-JJ. */
  onChoisir: (jour: string) => void;
}) {
  const selection = new Date(instantDuJour(jour));
  const calendrierRef = useRef<HTMLDivElement>(null);
  return (
    <Popover open={ouvert} onOpenChange={onOuvertChange}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            data-bouton-date=""
            aria-label={`Changer la date de « ${titre} »`}
            className="rounded-full text-muted-foreground hover:text-foreground aria-expanded:bg-foreground aria-expanded:text-background"
          />
        }
      >
        <CalendarDays aria-hidden />
      </PopoverTrigger>
      {/* À l'ouverture, le focus va au jour actuel du TODO, pas au bouton « mois précédent » : les flèches s'enchaînent. */}
      <PopoverContent
        align="end"
        initialFocus={() => calendrierRef.current?.querySelector<HTMLElement>('[data-selected-single="true"]') ?? true}
        className="w-auto max-w-[calc(100vw-2rem)]"
      >
        <div className="flex flex-col gap-0.5 px-1">
          <PopoverTitle>Changer la date</PopoverTitle>
          <PopoverDescription className="line-clamp-2 max-w-64">{titre}</PopoverDescription>
        </div>
        <div ref={calendrierRef}>
          <Calendar
            mode="single"
            required
            selected={selection}
            defaultMonth={selection}
            today={new Date(maintenant)}
            timeZone={FUSEAU}
            locale={fr}
            onSelect={(date) => onChoisir(cleJour(date.getTime()))}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
