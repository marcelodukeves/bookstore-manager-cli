/** Contrato com os dados de um autor já cadastrado. */
export interface IAutor {
  id: number;
  nome: string;
  nacionalidade: string;
}

/** Dados necessários para cadastrar um autor (o id é gerado pelo sistema). */
export type DadosNovoAutor = Omit<IAutor, "id">;

/** Entidade Autor da livraria. */
export class Autor implements IAutor {
  constructor(
    public readonly id: number,
    public nome: string,
    public nacionalidade: string
  ) {}

  /** Texto resumido para exibir o autor no terminal. */
  descricao(): string {
    return `[${this.id}] ${this.nome} (${this.nacionalidade})`;
  }
}