// server/src/application/menu/ObtenerMenuPublicoUseCase.ts

import { IMenuPublicoRepository } from '../../domain/repositories/IMenuRepository';

export class ObtenerMenuPublicoUseCase {
  constructor(private menuPublicoRepository: IMenuPublicoRepository) {}

  async execute(slug: string) {
    const slugLimpio = slug.trim().toLowerCase();

    if (!slugLimpio) {
      throw new Error('Slug del menú inválido.');
    }

    return this.menuPublicoRepository.obtenerPorSlug(slugLimpio);
  }
}