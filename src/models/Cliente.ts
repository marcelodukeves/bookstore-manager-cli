/** Contrato com os dados de um cliente já cadastrado. */
export interface ICliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
}

/** Dados necessários para cadastrar um cliente (o id é gerado pelo sistema). */
export type DadosNovoCliente = Omit<ICliente, "id">;

/** Entidade Cliente da livraria. */
export class Cliente implements ICliente {
  constructor(
    public readonly id: number,
    public nome: string,
    public email: string,
    public telefone: string
  ) {}

  /** Texto resumido para exibir o cliente no terminal. */
  descricao(): string {
    return `[${this.id}] ${this.nome} | E-mail: ${this.email} | Telefone: ${this.telefone}`;
  }
}