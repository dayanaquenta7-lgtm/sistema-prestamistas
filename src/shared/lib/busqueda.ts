/**
 * Patrón ILIKE "contiene" con los comodines escapados: lo que escribe el usuario
 * se busca literal ("50%" no equivale a "50 y cualquier cosa").
 */
export function patronContiene(texto: string): string {
  const escapado = texto.replace(/[\\%_]/g, (caracter) => `\\${caracter}`)
  return `%${escapado}%`
}
