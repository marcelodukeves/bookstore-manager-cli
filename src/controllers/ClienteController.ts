import { ClienteService } from "../services/ClienteService";
import { linhaSeparadora } from "../utils/formatadores";
import { leitorTerminal } from "../utils/leitorTerminal";
import { validarInteiroPositivo } from "../utils/validacoes";

/** Interação com o usuário no terminal para o módulo de clientes. */
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  async cadastrar(): Promise<void> {
    console.log("\n--- Cadastrar cliente ---");
    const nome = await leitorTerminal.perguntar("Nome: ");
    const email = await leitorTerminal.perguntar("E-mail: ");
    const telefone = await leitorTerminal.perguntar("Telefone: ");

    const cliente = await this.clienteService.cadastrar({ nome, email, telefone });
    console.log(`\n✅ Cliente cadastrado: ${cliente.descricao()}`);
    await leitorTerminal.aguardarEnter();
  }

  async listar(): Promise<void> {
    console.log("\n--- Clientes cadastrados ---");
    const clientes = await this.clienteService.listar();

    if (clientes.length === 0) {
      console.log("Nenhum cliente cadastrado.");
    } else {
      clientes.forEach((cliente) => console.log(cliente.descricao()));
      console.log(linhaSeparadora());
      console.log(`Total: ${clientes.length}`);
    }
    await leitorTerminal.aguardarEnter();
  }

  async consultarPorId(): Promise<void> {
    console.log("\n--- Consultar cliente ---");
    const id = await this.lerId();

    const cliente = await this.clienteService.buscarPorId(id);
    console.log(`\n${cliente.descricao()}`);
    await leitorTerminal.aguardarEnter();
  }

  async atualizar(): Promise<void> {
    console.log("\n--- Atualizar cliente ---");
    const id = await this.lerId();
    const clienteAtual = await this.clienteService.buscarPorId(id);

    console.log(`Dados atuais: ${clienteAtual.descricao()}`);
    console.log("(Deixe em branco para manter o valor atual)");
    const nome = await leitorTerminal.perguntar("Novo nome: ");
    const email = await leitorTerminal.perguntar("Novo e-mail: ");
    const telefone = await leitorTerminal.perguntar("Novo telefone: ");

    const clienteAtualizado = await this.clienteService.atualizar(id, {
      nome: nome || clienteAtual.nome,
      email: email || clienteAtual.email,
      telefone: telefone || clienteAtual.telefone,
    });
    console.log(`\n✅ Cliente atualizado: ${clienteAtualizado.descricao()}`);
    await leitorTerminal.aguardarEnter();
  }

  async remover(): Promise<void> {
    console.log("\n--- Remover cliente ---");
    const id = await this.lerId();
    const cliente = await this.clienteService.buscarPorId(id);

    const confirmacao = await leitorTerminal.perguntar(`Remover "${cliente.nome}"? (s/n): `);
    if (confirmacao.toLowerCase() !== "s") {
      console.log("\nRemoção cancelada.");
    } else {
      await this.clienteService.remover(id);
      console.log("\n✅ Cliente removido com sucesso.");
    }
    await leitorTerminal.aguardarEnter();
  }

  private async lerId(): Promise<number> {
    const texto = await leitorTerminal.perguntar("ID do cliente: ");
    return validarInteiroPositivo(texto, "ID");
  }
}