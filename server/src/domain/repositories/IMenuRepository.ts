import { Menu } from "../entities/Menu";

export interface IMenuPublicoRepository {
  obtenerPorSlug(slug: string): Promise<Menu | null>;
}