import { AutorService } from "../services/AutorService";
import { LivroService } from "../services/LivroService";
import { linhaSeparadora } from "../utils/formatadores";
import { leitorTerminal } from "../utils/leitorTerminal";
import { validarInteiroPositivo } from "../utils/validacoes";

/** Interação com o usuário no terminal para o módulo de livros. */
export class LivroController {
  constructor(
    private readonly livroService: LivroService,
    private readonly autorService: AutorService
  ) {}

  async cadastrar(): Promise<void> {
    console.log("\n--- Cadastrar livro ---");
    await this.mostrarAutoresDisponiveis();

    const titulo = await leitorTerminal.perguntar("Título: ");
    const isbn = await leitorTerminal.perguntar("ISBN: ");
    const anoPublicacao = await leitorTerminal.perguntar("Ano de publicação: ");
    const autorId = await leitorTerminal.perguntar("ID do autor: ");
    const quantidadeTotal = await leitorTerminal.perguntar("Quantidade de exemplares: ");

    const livro = await this.livroService.cadastrar({
      titulo,
      isbn,
      anoPublicacao: Number(anoPublicacao),
      autorId: Number(autorId),
      quantidadeTotal: Number(quantidadeTotal),
    });
    console.log(`\n✅ Livro cadastrado: ${livro.descricao()}`);
    await leitorTerminal.aguardarEnter();
  }

  async listar(): Promise<void> {
    console.log("\n--- Livros cadastrados ---");
    const livros = await this.livroService.listar();

    if (livros.length === 0) {
      console.log("Nenhum livro cadastrado.");
    } else {
      livros.forEach((livro) => console.log(livro.descricao()));
      console.log(linhaSeparadora());
      console.log(`Total: ${livros.length}`);
    }
    await leitorTerminal.aguardarEnter();
  }

  async consultarPorId(): Promise<void> {
    console.log("\n--- Consultar livro ---");
    const id = await this.lerId();

    const livro = await this.livroService.buscarPorId(id);
    const autor = await this.autorService.buscarPorId(livro.autorId);
    console.log(`\n${livro.descricao()}`);
    console.log(`Autor: ${autor.nome}`);
    await leitorTerminal.aguardarEnter();
  }

  async atualizar(): Promise<void> {
    console.log("\n--- Atualizar livro ---");
    const id = await this.lerId();
    const livroAtual = await this.livroService.buscarPorId(id);

    console.log(`Dados atuais: ${livroAtual.descricao()}`);
    console.log("(Deixe em branco para manter o valor atual)");
    await this.mostrarAutoresDisponiveis();

    const titulo = await leitorTerminal.perguntar("Novo título: ");
    const isbn = await leitorTerminal.perguntar("Novo ISBN: ");
    const anoPublicacao = await leitorTerminal.perguntar("Novo ano de publicação: ");
    const autorId = await leitorTerminal.perguntar("Novo ID do autor: ");
    const quantidadeTotal = await leitorTerminal.perguntar("Nova quantidade de exemplares: ");

    const livroAtualizado = await this.livroService.atualizar(id, {
      titulo: titulo || livroAtual.titulo,
      isbn: isbn || livroAtual.isbn,
      anoPublicacao: anoPublicacao ? Number(anoPublicacao) : livroAtual.anoPublicacao,
      autorId: autorId ? Number(autorId) : livroAtual.autorId,
      quantidadeTotal: quantidadeTotal ? Number(quantidadeTotal) : livroAtual.quantidadeTotal,
    });
    console.log(`\n✅ Livro atualizado: ${livroAtualizado.descricao()}`);
    await leitorTerminal.aguardarEnter();
  }

  async remover(): Promise<void> {
    console.log("\n--- Remover livro ---");
    const id = await this.lerId();
    const livro = await this.livroService.buscarPorId(id);

    const confirmacao = await leitorTerminal.perguntar(`Remover "${livro.titulo}"? (s/n): `);
    if (confirmacao.toLowerCase() !== "s") {
      console.log("\nRemoção cancelada.");
    } else {
      await this.livroService.remover(id);
      console.log("\n✅ Livro removido com sucesso.");
    }
    await leitorTerminal.aguardarEnter();
  }

  /** Mostra os autores cadastrados para o usuário escolher o ID. */
  private async mostrarAutoresDisponiveis(): Promise<void> {
    const autores = await this.autorService.listar();
    console.log("\nAutores disponíveis:");
    if (autores.length === 0) {
      console.log("  (nenhum autor cadastrado, cadastre um autor primeiro)");
    } else {
      autores.forEach((autor) => console.log(`  ${autor.descricao()}`));
    }
    console.log("");
  }

  private async lerId(): Promise<number> {
    const texto = await leitorTerminal.perguntar("ID do livro: ");
    return validarInteiroPositivo(texto, "ID");
  }
}