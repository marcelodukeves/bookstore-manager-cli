import { formatarData } from "../utils/formatadores";

/** Contrato com os dados de um empréstimo já registrado. */
export interface IEmprestimo {
  id: number;
  livroId: number;
  clienteId: number;
  dataEmprestimo: Date;
  dataDevolucao: Date | null;
}

/**
 * Dados necessários para registrar um empréstimo.
 * A data é opcional: se não for informada, usa o momento atual.
 */
export interface DadosNovoEmprestimo {
  livroId: number;
  clienteId: number;
  dataEmprestimo?: Date;
}

/** Entidade Empréstimo da livraria. */
export class Emprestimo implements IEmprestimo {
  constructor(
    public readonly id: number,
    public readonly livroId: number,
    public readonly clienteId: number,
    public readonly dataEmprestimo: Date,
    public dataDevolucao: Date | null = null
  ) {}

  /** Um empréstimo está ativo enquanto o livro não foi devolvido. */
  estaAtivo(): boolean {
    return this.dataDevolucao === null;
  }

  /** Texto resumido para exibir o empréstimo no terminal. */
  descricao(): string {
    const situacao = this.dataDevolucao
      ? `Devolvido em ${formatarData(this.dataDevolucao)}`
      : "Ativo";
    return `[${this.id}] Livro ID: ${this.livroId} | Cliente ID: ${this.clienteId} | Empréstimo: ${formatarData(this.dataEmprestimo)} | ${situacao}`;
  }
}