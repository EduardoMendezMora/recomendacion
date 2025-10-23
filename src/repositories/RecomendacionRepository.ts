/**
 * Repositorio: RecomendacionRepository
 * Maneja la persistencia de recomendaciones
 */

import { Recomendacion, IRecomendacion, EstadoRecomendacion } from '../models/Recomendacion';
import { JsonRepository } from './JsonRepository';

export class RecomendacionRepository extends JsonRepository<Recomendacion> {
  constructor(dataPath?: string) {
    super('recomendaciones.json', dataPath);
  }

  /**
   * Busca recomendaciones por cliente recomendador
   */
  public async findByRecomendador(clienteId: string): Promise<Recomendacion[]> {
    const recomendaciones = await this.leerDatos();
    return recomendaciones.filter(r => r.clienteRecomendadorId === clienteId);
  }

  /**
   * Busca una recomendación por teléfono del recomendado
   */
  public async findByTelefonoRecomendado(telefono: string): Promise<Recomendacion | null> {
    const recomendaciones = await this.leerDatos();
    return recomendaciones.find(r => r.telefonoRecomendado === telefono) || null;
  }

  /**
   * Obtiene recomendaciones pendientes
   */
  public async findPendientes(): Promise<Recomendacion[]> {
    const recomendaciones = await this.leerDatos();
    return recomendaciones.filter(r => r.estado === EstadoRecomendacion.PENDIENTE);
  }

  /**
   * Obtiene recomendaciones aceptadas
   */
  public async findAceptadas(): Promise<Recomendacion[]> {
    const recomendaciones = await this.leerDatos();
    return recomendaciones.filter(r => r.estado === EstadoRecomendacion.ACEPTADA);
  }

  /**
   * Obtiene recomendaciones que no han enviado mensaje
   */
  public async findSinMensajeEnviado(): Promise<Recomendacion[]> {
    const recomendaciones = await this.leerDatos();
    return recomendaciones.filter(r => !r.mensajeEnviado);
  }

  /**
   * Verifica si un teléfono ya fue recomendado
   */
  public async existeRecomendacion(telefono: string): Promise<boolean> {
    const recomendacion = await this.findByTelefonoRecomendado(telefono);
    return recomendacion !== null;
  }

  protected fromJSON(data: any): Recomendacion {
    return Recomendacion.fromJSON(data);
  }

  protected toJSON(entity: Recomendacion): IRecomendacion {
    return entity.toJSON();
  }
}
