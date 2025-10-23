/**
 * Repositorio: ClienteRepository
 * Maneja la persistencia de clientes
 */

import { Cliente, ICliente } from '../models/Cliente';
import { JsonRepository } from './JsonRepository';

export class ClienteRepository extends JsonRepository<Cliente> {
  constructor(dataPath?: string) {
    super('clientes.json', dataPath);
  }

  /**
   * Busca un cliente por su teléfono
   */
  public async findByTelefono(telefono: string): Promise<Cliente | null> {
    const clientes = await this.leerDatos();
    return clientes.find(c => c.telefono === telefono) || null;
  }

  /**
   * Busca un cliente por su código de referido
   */
  public async findByCodigoReferido(codigo: string): Promise<Cliente | null> {
    const clientes = await this.leerDatos();
    return clientes.find(c => c.codigoReferido === codigo) || null;
  }

  /**
   * Obtiene todos los clientes recomendados por un cliente
   */
  public async findRecomendacionesByCliente(clienteId: string): Promise<Cliente[]> {
    const cliente = await this.findById(clienteId);
    if (!cliente) {
      return [];
    }

    const clientes = await this.leerDatos();
    return clientes.filter(c => cliente.recomendaciones.includes(c.id));
  }

  /**
   * Obtiene clientes activos
   */
  public async findActivos(): Promise<Cliente[]> {
    const clientes = await this.leerDatos();
    return clientes.filter(c => c.activo);
  }

  /**
   * Verifica si un código de referido ya existe
   */
  public async existeCodigoReferido(codigo: string): Promise<boolean> {
    const cliente = await this.findByCodigoReferido(codigo);
    return cliente !== null;
  }

  /**
   * Verifica si un teléfono ya está registrado
   */
  public async existeTelefono(telefono: string): Promise<boolean> {
    const cliente = await this.findByTelefono(telefono);
    return cliente !== null;
  }

  protected fromJSON(data: any): Cliente {
    return Cliente.fromJSON(data);
  }

  protected toJSON(entity: Cliente): ICliente {
    return entity.toJSON();
  }
}
