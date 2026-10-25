import { AutorService } from "../services/AutorService";
import { linhaSeparadora } from "../utils/formatadores";
import { leitorTerminal } from "../utils/leitorTerminal";
import { validarInteiroPositivo } from "../utils/validacoes";

/** Interação com o usuário no terminal para o módulo de autores. */
export class AutorController {
  constructor(private readonly autorService: AutorService) {}

  async cadastrar(): Promise<void> {
    console.log("\n--- Cadastrar autor ---");
    const nome = await leitorTerminal.perguntar("Nome: ");
    const nacionalidade = await leitorTerminal.perguntar("Nacionalidade: ");

    const autor = await this.autorService.cadastrar({ nome, nacionalidade });
    console.log(`\n✅ Autor cadastrado: ${autor.descricao()}`);
    await leitorTerminal.aguardarEnter();
  }

  async listar(): Promise<void> {
    console.log("\n--- Autores cadastrados ---");
    const autores = await this.autorService.listar();

    if (autores.length === 0) {
      console.log("Nenhum autor cadastrado.");
    } else {
      autores.forEach((autor) => console.log(autor.descricao()));
      console.log(linhaSeparadora());
      console.log(`Total: ${autores.length}`);
    }
    await leitorTerminal.aguardarEnter();
  }

  async consultarPorId(): Promise<void> {
    console.log("\n--- Consultar autor ---");
    const id = await this.lerId();

    const autor = await this.autorService.buscarPorId(id);
    console.log(`\n${autor.descricao()}`);
    await leitorTerminal.aguardarEnter();
  }

  async atualizar(): Promise<void> {
    console.log("\n--- Atualizar autor ---");
    const id = await this.lerId();
    const autorAtual = await this.autorService.buscarPorId(id);

    console.log(`Dados atuais: ${autorAtual.descricao()}`);
    console.log("(Deixe em branco para manter o valor atual)");
    const nome = await leitorTerminal.perguntar("Novo nome: ");
    const nacionalidade = await leitorTerminal.perguntar("Nova nacionalidade: ");

    const autorAtualizado = await this.autorService.atualizar(id, {
      nome: nome || autorAtual.nome,
      nacionalidade: nacionalidade || autorAtual.nacionalidade,
    });
    console.log(`\n✅ Autor atualizado: ${autorAtualizado.descricao()}`);
    await leitorTerminal.aguardarEnter();
  }

  async remover(): Promise<void> {
    console.log("\n--- Remover autor ---");
    const id = await this.lerId();
    const autor = await this.autorService.buscarPorId(id);

    const confirmacao = await leitorTerminal.perguntar(`Remover "${autor.nome}"? (s/n): `);
    if (confirmacao.toLowerCase() !== "s") {
      console.log("\nRemoção cancelada.");
    } else {
      await this.autorService.remover(id);
      console.log("\n✅ Autor removido com sucesso.");
    }
    await leitorTerminal.aguardarEnter();
  }

  private async lerId(): Promise<number> {
    const texto = await leitorTerminal.perguntar("ID do autor: ");
    return validarInteiroPositivo(texto, "ID");
  }
}