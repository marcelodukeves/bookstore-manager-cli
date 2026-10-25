import { DadosNovoEmprestimo, Emprestimo } from "../models/Emprestimo";

/**
 * Armazena e recupera empréstimos em memória.
 * É a única camada autorizada a manipular a coleção de empréstimos.
 */
export class EmprestimoRepository {
  private readonly emprestimos: Map<number, Emprestimo> = new Map();
  private proximoId: number = 1;

  /** Registra um empréstimo ativo. Sem data informada, usa o momento atual. */
  async inserir(dados: DadosNovoEmprestimo): Promise<Emprestimo> {
    const emprestimo = new Emprestimo(
      this.proximoId,
      dados.livroId,
      dados.clienteId,
      dados.dataEmprestimo ?? new Date()
    );
    this.emprestimos.set(emprestimo.id, emprestimo);
    this.proximoId++;
    return emprestimo;
  }

  async listarTodos(): Promise<Emprestimo[]> {
    return Array.from(this.emprestimos.values());
  }

  async buscarPorId(id: number): Promise<Emprestimo | undefined> {
    return this.emprestimos.get(id);
  }

  /** Lista apenas os empréstimos que ainda não foram devolvidos. */
  async listarAtivos(): Promise<Emprestimo[]> {
    return Array.from(this.emprestimos.values()).filter((emprestimo) => emprestimo.estaAtivo());
  }

  /** Lista todos os empréstimos de um livro (usado para proteger a remoção do livro). */
  async listarPorLivro(livroId: number): Promise<Emprestimo[]> {
    return Array.from(this.emprestimos.values()).filter((emprestimo) => emprestimo.livroId === livroId);
  }

  /** Lista todos os empréstimos de um cliente (usado para proteger a remoção do cliente). */
  async listarPorCliente(clienteId: number): Promise<Emprestimo[]> {
    return Array.from(this.emprestimos.values()).filter((emprestimo) => emprestimo.clienteId === clienteId);
  }

  /** Substitui os dados de um empréstimo já existente (usado na devolução). */
  async atualizar(emprestimo: Emprestimo): Promise<void> {
    this.emprestimos.set(emprestimo.id, emprestimo);
  }
}
