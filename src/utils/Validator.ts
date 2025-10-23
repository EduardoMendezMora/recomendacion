/**
 * Utilidad: Validador
 * Contiene métodos de validación reutilizables
 */

export class Validator {
  /**
   * Valida que un teléfono sea de Costa Rica
   * Formato esperado: +506XXXXXXXX
   */
  public static validarTelefonoCR(telefono: string): boolean {
    const regex = /^\+506\d{8}$/;
    return regex.test(telefono);
  }

  /**
   * Normaliza un número de teléfono de Costa Rica
   * Acepta varios formatos y retorna +506XXXXXXXX
   */
  public static normalizarTelefonoCR(telefono: string): string {
    // Remover espacios, guiones y paréntesis
    let limpio = telefono.replace(/[\s\-\(\)]/g, '');

    // Si empieza con 00506, reemplazar por +506
    if (limpio.startsWith('00506')) {
      limpio = '+' + limpio.substring(2);
    }
    // Si empieza con 506, agregar +
    else if (limpio.startsWith('506') && limpio.length === 11) {
      limpio = '+' + limpio;
    }
    // Si no tiene prefijo, agregarlo
    else if (!limpio.startsWith('+506') && limpio.length === 8) {
      limpio = '+506' + limpio;
    }

    return limpio;
  }

  /**
   * Valida que un nombre sea válido
   */
  public static validarNombre(nombre: string): boolean {
    if (!nombre || nombre.trim().length === 0) {
      return false;
    }

    if (nombre.trim().length < 2) {
      return false;
    }

    // Validar que contenga solo letras, espacios y caracteres latinos
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    return regex.test(nombre.trim());
  }

  /**
   * Valida que un código de referido sea válido
   */
  public static validarCodigoReferido(codigo: string): boolean {
    if (!codigo || codigo.length !== 4) {
      return false;
    }

    const regex = /^\d{4}$/;
    return regex.test(codigo);
  }

  /**
   * Sanitiza un string removiendo caracteres peligrosos
   */
  public static sanitizar(texto: string): string {
    return texto
      .replace(/[<>]/g, '') // Remover < y >
      .trim();
  }
}
