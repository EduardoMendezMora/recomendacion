/**
 * Repositorio base para almacenamiento en archivo JSON
 * Implementa el patrón Repository para persistencia
 */

import * as fs from 'fs';
import * as path from 'path';
import { IRepository } from './IRepository';

export abstract class JsonRepository<T extends { id: string }> implements IRepository<T> {
  protected filePath: string;

  constructor(fileName: string, dataPath: string = './data') {
    this.filePath = path.join(dataPath, fileName);
    this.inicializarArchivo();
  }

  /**
   * Inicializa el archivo si no existe
   */
  private inicializarArchivo(): void {
    const dirPath = path.dirname(this.filePath);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  /**
   * Lee todos los datos del archivo
   */
  protected async leerDatos(): Promise<T[]> {
    try {
      const contenido = fs.readFileSync(this.filePath, 'utf-8');
      const datos = JSON.parse(contenido);
      return datos.map((item: any) => this.fromJSON(item));
    } catch (error) {
      console.error('Error al leer datos:', error);
      return [];
    }
  }

  /**
   * Escribe todos los datos al archivo
   */
  protected async escribirDatos(datos: T[]): Promise<void> {
    try {
      const json = JSON.stringify(datos.map(item => this.toJSON(item)), null, 2);
      fs.writeFileSync(this.filePath, json, 'utf-8');
    } catch (error) {
      console.error('Error al escribir datos:', error);
      throw new Error('Error al guardar datos');
    }
  }

  /**
   * Busca una entidad por ID
   */
  public async findById(id: string): Promise<T | null> {
    const datos = await this.leerDatos();
    return datos.find(item => item.id === id) || null;
  }

  /**
   * Obtiene todas las entidades
   */
  public async findAll(): Promise<T[]> {
    return await this.leerDatos();
  }

  /**
   * Guarda una nueva entidad
   */
  public async save(entity: T): Promise<T> {
    const datos = await this.leerDatos();
    datos.push(entity);
    await this.escribirDatos(datos);
    return entity;
  }

  /**
   * Actualiza una entidad existente
   */
  public async update(id: string, entity: T): Promise<T> {
    const datos = await this.leerDatos();
    const index = datos.findIndex(item => item.id === id);

    if (index === -1) {
      throw new Error(`Entidad con ID ${id} no encontrada`);
    }

    datos[index] = entity;
    await this.escribirDatos(datos);
    return entity;
  }

  /**
   * Elimina una entidad
   */
  public async delete(id: string): Promise<boolean> {
    const datos = await this.leerDatos();
    const index = datos.findIndex(item => item.id === id);

    if (index === -1) {
      return false;
    }

    datos.splice(index, 1);
    await this.escribirDatos(datos);
    return true;
  }

  /**
   * Convierte un objeto JSON a la entidad
   * Debe ser implementado por las clases derivadas
   */
  protected abstract fromJSON(data: any): T;

  /**
   * Convierte la entidad a un objeto JSON
   * Debe ser implementado por las clases derivadas
   */
  protected abstract toJSON(entity: T): any;
}
