import { Emprestimo } from "../models/Emprestimo";
import { EmprestimoRepository } from "../repositories/EmprestimoRepository";
import { ErroDeNegocio } from "../utils/ErroDeNegocio";
import { validarInteiroPositivo } from "../utils/validacoes";
import { ClienteService } from "./ClienteService";
import { LivroService } from "./LivroService";

/** Empréstimo junto com os nomes do livro e do cliente, para exibição na listagem. */
export interface DetalheEmprestimo {
  emprestimo: Emprestimo;
  tituloLivro: string;
  nomeCliente: string;
}

/** Regras de negócio do módulo de empréstimos e devoluções. */
export class EmprestimoService {
  constructor(
    private readonly emprestimoRepository: EmprestimoRepository,
    private readonly livroService: LivroService,
    private readonly clienteService: ClienteService
  ) {}

  /**
   * Registra o empréstimo de um livro para um cliente (RF10).
   * Valida a existência do livro e do cliente, a disponibilidade e a duplicidade.
   */
  async registrar(livroId: number, clienteId: number): Promise<Emprestimo> {
    const idLivro = validarInteiroPositivo(String(livroId), "ID do livro");
    const idCliente = validarInteiroPositivo(String(clienteId), "ID do cliente");

    const livro = await this.livroService.buscarPorId(idLivro);
    const cliente = await this.clienteService.buscarPorId(idCliente);
    await this.garantirQueClienteNaoTemOLivro(idLivro, idCliente, livro.titulo, cliente.nome);

    await this.livroService.reservarExemplar(idLivro);
    return this.emprestimoRepository.inserir({ livroId: idLivro, clienteId: idCliente });
  }

  /** Registra a devolução de um livro e devolve o exemplar ao estoque (RF11). */
  async devolver(emprestimoId: number): Promise<Emprestimo> {
    const emprestimo = await this.buscarPorId(emprestimoId);

    if (!emprestimo.estaAtivo()) {
      throw new ErroDeNegocio(`O empréstimo ${emprestimoId} já foi devolvido.`);
    }

    emprestimo.dataDevolucao = new Date();
    await this.emprestimoRepository.atualizar(emprestimo);
    await this.livroService.reporExemplar(emprestimo.livroId);
    return emprestimo;
  }

  /** Busca um empréstimo e lança erro se ele não existir. */
  async buscarPorId(id: number): Promise<Emprestimo> {
    const emprestimo = await this.emprestimoRepository.buscarPorId(id);
    if (!emprestimo) {
      throw new ErroDeNegocio(`Empréstimo com id ${id} não encontrado.`);
    }
    return emprestimo;
  }

  /** Lista os empréstimos com dados do livro e do cliente (RF12). */
  async listarDetalhado(somenteAtivos: boolean = false): Promise<DetalheEmprestimo[]> {
    const emprestimos = somenteAtivos
      ? await this.emprestimoRepository.listarAtivos()
      : await this.emprestimoRepository.listarTodos();

    const detalhes: DetalheEmprestimo[] = [];
    for (const emprestimo of emprestimos) {
      const livro = await this.livroService.buscarPorId(emprestimo.livroId);
      const cliente = await this.clienteService.buscarPorId(emprestimo.clienteId);
      detalhes.push({ emprestimo, tituloLivro: livro.titulo, nomeCliente: cliente.nome });
    }
    return detalhes;
  }

  /** Impede que o mesmo cliente pegue de novo um livro que ainda não devolveu (RF13). */
  private async garantirQueClienteNaoTemOLivro(
    livroId: number,
    clienteId: number,
    tituloLivro: string,
    nomeCliente: string
  ): Promise<void> {
    const emprestimosAtivos = await this.emprestimoRepository.listarAtivos();
    const jaTemOLivro = emprestimosAtivos.some(
      (emprestimo) => emprestimo.livroId === livroId && emprestimo.clienteId === clienteId
    );

    if (jaTemOLivro) {
      throw new ErroDeNegocio(`"${nomeCliente}" já possui um empréstimo ativo do livro "${tituloLivro}".`);
    }
  }
}