import { ClienteService } from "../services/ClienteService";
import { DetalheEmprestimo, EmprestimoService } from "../services/EmprestimoService";
import { LivroService } from "../services/LivroService";
import { formatarData, linhaSeparadora } from "../utils/formatadores";
import { leitorTerminal } from "../utils/leitorTerminal";
import { validarInteiroPositivo } from "../utils/validacoes";

/** Interação com o usuário no terminal para o módulo de empréstimos. */
export class EmprestimoController {
  constructor(
    private readonly emprestimoService: EmprestimoService,
    private readonly livroService: LivroService,
    private readonly clienteService: ClienteService
  ) {}

  async registrar(): Promise<void> {
    console.log("\n--- Registrar empréstimo ---");
    await this.mostrarLivros();
    await this.mostrarClientes();

    const livroId = validarInteiroPositivo(await leitorTerminal.perguntar("ID do livro: "), "ID do livro");
    const clienteId = validarInteiroPositivo(await leitorTerminal.perguntar("ID do cliente: "), "ID do cliente");

    const emprestimo = await this.emprestimoService.registrar(livroId, clienteId);
    console.log(`\n✅ Empréstimo registrado: ${emprestimo.descricao()}`);
    await leitorTerminal.aguardarEnter();
  }

  async devolver(): Promise<void> {
    console.log("\n--- Registrar devolução ---");
    await this.mostrarEmprestimosAtivos();

    const emprestimoId = validarInteiroPositivo(
      await leitorTerminal.perguntar("ID do empréstimo: "),
      "ID do empréstimo"
    );

    const emprestimo = await this.emprestimoService.devolver(emprestimoId);
    console.log(`\n✅ Devolução registrada: ${emprestimo.descricao()}`);
    await leitorTerminal.aguardarEnter();
  }

  async listarTodos(): Promise<void> {
    console.log("\n--- Todos os empréstimos ---");
    const detalhes = await this.emprestimoService.listarDetalhado();
    this.exibirDetalhes(detalhes);
    await leitorTerminal.aguardarEnter();
  }

  async listarAtivos(): Promise<void> {
    console.log("\n--- Empréstimos ativos ---");
    const detalhes = await this.emprestimoService.listarDetalhado(true);
    this.exibirDetalhes(detalhes);
    await leitorTerminal.aguardarEnter();
  }

  private async mostrarLivros(): Promise<void> {
    const livros = await this.livroService.listar();
    console.log("\nLivros:");
    if (livros.length === 0) {
      console.log("  (nenhum livro cadastrado)");
    } else {
      livros.forEach((livro) => console.log(`  ${livro.descricao()}`));
    }
  }

  private async mostrarClientes(): Promise<void> {
    const clientes = await this.clienteService.listar();
    console.log("\nClientes:");
    if (clientes.length === 0) {
      console.log("  (nenhum cliente cadastrado)");
    } else {
      clientes.forEach((cliente) => console.log(`  ${cliente.descricao()}`));
    }
    console.log("");
  }

  private async mostrarEmprestimosAtivos(): Promise<void> {
    const detalhes = await this.emprestimoService.listarDetalhado(true);
    console.log("\nEmpréstimos ativos:");
    if (detalhes.length === 0) {
      console.log("  (nenhum empréstimo ativo)");
    } else {
      detalhes.forEach((detalhe) => console.log(`  ${this.descreverDetalhe(detalhe)}`));
    }
    console.log("");
  }

  private exibirDetalhes(detalhes: DetalheEmprestimo[]): void {
    if (detalhes.length === 0) {
      console.log("Nenhum empréstimo encontrado.");
      return;
    }
    detalhes.forEach((detalhe) => console.log(this.descreverDetalhe(detalhe)));
    console.log(linhaSeparadora());
    console.log(`Total: ${detalhes.length}`);
  }

  /** Monta a linha de exibição com livro, cliente, data e situação do empréstimo. */
  private descreverDetalhe(detalhe: DetalheEmprestimo): string {
    const { emprestimo, tituloLivro, nomeCliente } = detalhe;
    const situacao = emprestimo.dataDevolucao
      ? `Devolvido em ${formatarData(emprestimo.dataDevolucao)}`
      : "Ativo";
    return `[${emprestimo.id}] Livro: ${tituloLivro} | Cliente: ${nomeCliente} | Empréstimo: ${formatarData(emprestimo.dataEmprestimo)} | ${situacao}`;
  }
}