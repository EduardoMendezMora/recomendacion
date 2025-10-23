/**
 * Modelo de dominio: Cliente
 * Representa un cliente en el sistema de recomendación piramidal
 */

export interface ICliente {
  id: string;
  nombre: string;
  telefono: string; // Formato: +506XXXXXXXX
  codigoReferido: string; // Código único de 4 dígitos
  referidoPor?: string; // ID del cliente que lo recomendó
  fechaRegistro: Date;
  recomendaciones: string[]; // IDs de clientes recomendados
  activo: boolean;
}

export class Cliente implements ICliente {
  public id: string;
  public nombre: string;
  public telefono: string;
  public codigoReferido: string;
  public referidoPor?: string;
  public fechaRegistro: Date;
  public recomendaciones: string[];
  public activo: boolean;

  constructor(data: Partial<ICliente>) {
    this.id = data.id || '';
    this.nombre = data.nombre || '';
    this.telefono = data.telefono || '';
    this.codigoReferido = data.codigoReferido || '';
    this.referidoPor = data.referidoPor;
    this.fechaRegistro = data.fechaRegistro || new Date();
    this.recomendaciones = data.recomendaciones || [];
    this.activo = data.activo !== undefined ? data.activo : true;
  }

  /**
   * Valida que el cliente tenga todos los datos requeridos
   */
  public validar(): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!this.nombre || this.nombre.trim().length === 0) {
      errores.push('El nombre es requerido');
    }

    if (!this.telefono || !this.validarTelefono()) {
      errores.push('El teléfono debe ser válido para Costa Rica (+506XXXXXXXX)');
    }

    if (!this.codigoReferido || this.codigoReferido.length !== 4) {
      errores.push('El código de referido debe tener 4 dígitos');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  /**
   * Valida que el teléfono sea de Costa Rica
   */
  private validarTelefono(): boolean {
    // Formato: +506XXXXXXXX (506 + 8 dígitos)
    const regex = /^\+506\d{8}$/;
    return regex.test(this.telefono);
  }

  /**
   * Agrega una recomendación al cliente
   */
  public agregarRecomendacion(clienteId: string): void {
    if (!this.recomendaciones.includes(clienteId)) {
      this.recomendaciones.push(clienteId);
    }
  }

  /**
   * Obtiene el número total de recomendaciones
   */
  public getTotalRecomendaciones(): number {
    return this.recomendaciones.length;
  }

  /**
   * Convierte el cliente a un objeto plano para persistencia
   */
  public toJSON(): ICliente {
    return {
      id: this.id,
      nombre: this.nombre,
      telefono: this.telefono,
      codigoReferido: this.codigoReferido,
      referidoPor: this.referidoPor,
      fechaRegistro: this.fechaRegistro,
      recomendaciones: this.recomendaciones,
      activo: this.activo
    };
  }

  /**
   * Crea una instancia de Cliente desde un objeto plano
   */
  public static fromJSON(data: any): Cliente {
    return new Cliente({
      ...data,
      fechaRegistro: new Date(data.fechaRegistro)
    });
  }
}
