import { Autor, DadosNovoAutor } from "../models/Autor";

/**
 * Armazena e recupera autores em memória.
 * É a única camada autorizada a manipular a coleção de autores.
 */
export class AutorRepository {
  private readonly autores: Map<number, Autor> = new Map();
  private proximoId: number = 1;

  /** Cria um autor com um novo id sequencial e o guarda na memória. */
  async inserir(dados: DadosNovoAutor): Promise<Autor> {
    const autor = new Autor(this.proximoId, dados.nome, dados.nacionalidade);
    this.autores.set(autor.id, autor);
    this.proximoId++;
    return autor;
  }

  async listarTodos(): Promise<Autor[]> {
    return Array.from(this.autores.values());
  }

  async buscarPorId(id: number): Promise<Autor | undefined> {
    return this.autores.get(id);
  }

  /** Busca um autor pelo nome, ignorando maiúsculas e minúsculas. */
  async buscarPorNome(nome: string): Promise<Autor | undefined> {
    const nomeNormalizado = nome.trim().toLowerCase();
    return Array.from(this.autores.values()).find(
      (autor) => autor.nome.toLowerCase() === nomeNormalizado
    );
  }

  /** Substitui os dados de um autor já existente. */
  async atualizar(autor: Autor): Promise<void> {
    this.autores.set(autor.id, autor);
  }

  /** Remove o autor e devolve true se ele existia. */
  async remover(id: number): Promise<boolean> {
    return this.autores.delete(id);
  }
}
