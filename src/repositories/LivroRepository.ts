import { DadosNovoLivro, Livro } from "../models/Livro";

/**
 * Armazena e recupera livros em memória.
 * É a única camada autorizada a manipular a coleção de livros.
 */
export class LivroRepository {
  private readonly livros: Map<number, Livro> = new Map();
  private proximoId: number = 1;

  /** Cria um livro com id sequencial. A quantidade disponível começa igual à total. */
  async inserir(dados: DadosNovoLivro): Promise<Livro> {
    const livro = new Livro(
      this.proximoId,
      dados.titulo,
      dados.isbn,
      dados.anoPublicacao,
      dados.autorId,
      dados.quantidadeTotal,
      dados.quantidadeTotal
    );
    this.livros.set(livro.id, livro);
    this.proximoId++;
    return livro;
  }

  async listarTodos(): Promise<Livro[]> {
    return Array.from(this.livros.values());
  }

  async buscarPorId(id: number): Promise<Livro | undefined> {
    return this.livros.get(id);
  }

  /** Busca um livro pelo ISBN, ignorando espaços nas pontas. */
  async buscarPorIsbn(isbn: string): Promise<Livro | undefined> {
    const isbnNormalizado = isbn.trim();
    return Array.from(this.livros.values()).find((livro) => livro.isbn === isbnNormalizado);
  }

  /** Lista os livros de um autor (usado para impedir a remoção de autores com livros). */
  async listarPorAutor(autorId: number): Promise<Livro[]> {
    return Array.from(this.livros.values()).filter((livro) => livro.autorId === autorId);
  }

  /** Substitui os dados de um livro já existente. */
  async atualizar(livro: Livro): Promise<void> {
    this.livros.set(livro.id, livro);
  }

  /** Remove o livro e devolve true se ele existia. */
  async remover(id: number): Promise<boolean> {
    return this.livros.delete(id);
  }
}