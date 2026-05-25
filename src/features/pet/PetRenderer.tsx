import type { ReactElement, ReactNode } from "react";

import {
  DEFAULT_PET_SPECIES_ID,
  type PetDisplayMood,
  type PetSpeciesId,
} from "../../domain";
import { PET_SPECIES_REGISTRY } from "./petSpeciesRegistry";

import "./pet-art.css";

interface PetRendererProps {
  message: string;
  mood: PetDisplayMood;
  preview?: boolean;
  renderFigure?: (figure: ReactElement) => ReactNode;
  speciesId?: PetSpeciesId;
}

export function PetRenderer({
  message,
  mood,
  preview = false,
  renderFigure,
  speciesId = DEFAULT_PET_SPECIES_ID,
}: PetRendererProps) {
  const species = PET_SPECIES_REGISTRY[speciesId];
  const figure = (
    <span className="pet-art__figure">
      <span className="pet-art__tail" />
      <span className="pet-art__sparkles">
        <span />
        <span />
      </span>
      <span className="pet-art__zzz">
        <span>z</span>
        <span>z</span>
        <span>z</span>
      </span>
      <span className="pet-art__focus-bubbles">
        <span />
        <span />
        <span />
      </span>
      <span className="pet-art__heart" />
      <span className="pet-art__body">
        <span className="pet-art__horn pet-art__horn--left" />
        <span className="pet-art__horn pet-art__horn--right" />
        <span className="pet-art__patch pet-art__patch--head" />
        <span className="pet-art__patch pet-art__patch--body" />
        <span className="pet-art__ear pet-art__ear--left">
          <span />
        </span>
        <span className="pet-art__ear pet-art__ear--right">
          <span />
        </span>
        <span className="pet-art__face">
          <span className="pet-art__eye pet-art__eye--left" />
          <span className="pet-art__eye pet-art__eye--right" />
          <span className="pet-art__cheek pet-art__cheek--left" />
          <span className="pet-art__cheek pet-art__cheek--right" />
          <span className="pet-art__muzzle">
            <span />
            <span />
          </span>
          <span className="pet-art__mouth" />
          <span className="pet-art__tear" />
        </span>
        <span className="pet-art__hunger-pulses">
          <span />
          <span />
        </span>
      </span>
    </span>
  );

  return (
    <div
      aria-hidden="true"
      className={preview ? "pet-art pet-art--preview" : "pet-art"}
      data-mood={mood}
      data-species={species.id}
    >
      {preview ? null : <span className="pet-art__message">{message}</span>}
      <span className="pet-art__shadow" />
      {renderFigure ? renderFigure(figure) : figure}
      <span className="pet-art__paw pet-art__paw--left" />
      <span className="pet-art__paw pet-art__paw--right" />
    </div>
  );
}
