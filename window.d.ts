import { ecs, Layers } from "./types";

declare global {
  interface Window {
    layers: Layers;
    ecs: typeof ecs;
  }
}
