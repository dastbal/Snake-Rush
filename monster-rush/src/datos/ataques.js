/**
 * Ataques. poder: daño base · precision: % de acierto · pp: usos.
 * efecto (opcional): 'bajaAtaque' | 'bajaDefensa' | 'curaMitad'
 */
export const ATAQUES = {
  placaje: { nombre: 'Placaje', tipo: 'normal', poder: 40, precision: 100, pp: 35 },
  arañazo: { nombre: 'Arañazo', tipo: 'normal', poder: 40, precision: 100, pp: 35 },
  gruñido: { nombre: 'Gruñido', tipo: 'normal', poder: 0, precision: 100, pp: 40, efecto: 'bajaAtaque' },
  malicioso: { nombre: 'Malicioso', tipo: 'normal', poder: 0, precision: 100, pp: 30, efecto: 'bajaDefensa' },
  ataqueRapido: { nombre: 'Ataque Rápido', tipo: 'normal', poder: 45, precision: 100, pp: 30 },
  mordisco: { nombre: 'Mordisco', tipo: 'normal', poder: 60, precision: 100, pp: 25 },
  descanso: { nombre: 'Respiro', tipo: 'normal', poder: 0, precision: 100, pp: 10, efecto: 'curaMitad' },

  ascuas: { nombre: 'Ascuas', tipo: 'fuego', poder: 40, precision: 100, pp: 25 },
  llamarada: { nombre: 'Llamarada', tipo: 'fuego', poder: 70, precision: 90, pp: 15 },

  burbuja: { nombre: 'Burbuja', tipo: 'agua', poder: 40, precision: 100, pp: 30 },
  pistolaAgua: { nombre: 'Pistola Agua', tipo: 'agua', poder: 65, precision: 100, pp: 20 },

  latigo: { nombre: 'Látigo Hoja', tipo: 'planta', poder: 45, precision: 100, pp: 25 },
  hojaAfilada: { nombre: 'Hoja Afilada', tipo: 'planta', poder: 65, precision: 95, pp: 20 },

  impactrueno: { nombre: 'Impactrueno', tipo: 'electrico', poder: 40, precision: 100, pp: 30 },
  chispazo: { nombre: 'Chispazo', tipo: 'electrico', poder: 65, precision: 100, pp: 20 },

  picotazo: { nombre: 'Picotazo', tipo: 'volador', poder: 35, precision: 100, pp: 35 },
  ataqueAla: { nombre: 'Ataque Ala', tipo: 'volador', poder: 60, precision: 100, pp: 25 },
};
