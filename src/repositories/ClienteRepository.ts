import { Cliente, DadosNovoCliente } from "../models/Cliente";

/**
 * Armazena e recupera clientes em memória.
 * É a única camada autorizada a manipular a coleção de clientes.
 */
export class ClienteRepository {
  private readonly clientes: Map<number, Cliente> = new Map();
  private proximoId: number = 1;

  /** Cria um cliente com um novo id sequencial e o guarda na memória. */
  async inserir(dados: DadosNovoCliente): Promise<Cliente> {
    const cliente = new Cliente(this.proximoId, dados.nome, dados.email, dados.telefone);
    this.clientes.set(cliente.id, cliente);
    this.proximoId++;
    return cliente;
  }

  async listarTodos(): Promise<Cliente[]> {
    return Array.from(this.clientes.values());
  }

  async buscarPorId(id: number): Promise<Cliente | undefined> {
    return this.clientes.get(id);
  }

  /** Busca um cliente pelo e-mail, ignorando maiúsculas e minúsculas. */
  async buscarPorEmail(email: string): Promise<Cliente | undefined> {
    const emailNormalizado = email.trim().toLowerCase();
    return Array.from(this.clientes.values()).find(
      (cliente) => cliente.email.toLowerCase() === emailNormalizado
    );
  }

  /** Substitui os dados de um cliente já existente. */
  async atualizar(cliente: Cliente): Promise<void> {
    this.clientes.set(cliente.id, cliente);
  }

  /** Remove o cliente e devolve true se ele existia. */
  async remover(id: number): Promise<boolean> {
    return this.clientes.delete(id);
  }
}