/** Contrato com os dados de um livro já cadastrado. */
export interface ILivro {
  id: number;
  titulo: string;
  isbn: string;
  anoPublicacao: number;
  autorId: number;
  quantidadeTotal: number;
  quantidadeDisponivel: number;
}

/**
 * Dados necessários para cadastrar um livro.
 * O id é gerado pelo sistema e a quantidade disponível começa igual à total.
 */
export type DadosNovoLivro = Omit<ILivro, "id" | "quantidadeDisponivel">;

/** Entidade Livro da livraria. */
export class Livro implements ILivro {
  constructor(
    public readonly id: number,
    public titulo: string,
    public isbn: string,
    public anoPublicacao: number,
    public autorId: number,
    public quantidadeTotal: number,
    public quantidadeDisponivel: number
  ) {}

  /** Indica se existe pelo menos uma unidade para emprestar. */
  estaDisponivel(): boolean {
    return this.quantidadeDisponivel > 0;
  }

  /** Texto resumido para exibir o livro no terminal. */
  descricao(): string {
    return `[${this.id}] ${this.titulo} (${this.anoPublicacao}) | ISBN: ${this.isbn} | Autor ID: ${this.autorId} | Disponíveis: ${this.quantidadeDisponivel}/${this.quantidadeTotal}`;
  }
}