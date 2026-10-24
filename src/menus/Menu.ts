import { ErroDeNegocio } from "../utils/ErroDeNegocio";
import { linhaSeparadora } from "../utils/formatadores";
import { leitorTerminal } from "../utils/leitorTerminal";

/** Uma opção exibida no menu: código digitado, texto e ação executada. */
export interface OpcaoMenu {
  codigo: string;
  titulo: string;
  acao: () => Promise<void>;
}

/**
 * Menu genérico de terminal.
 * Exibe as opções, lê a escolha do usuário e executa a ação correspondente.
 * A opção "0" sempre encerra o menu.
 */
export class Menu {
  constructor(
    private readonly titulo: string,
    private readonly opcoes: OpcaoMenu[],
    private readonly textoSaida: string = "Voltar"
  ) {}

  async exibir(): Promise<void> {
    let continuarNoMenu = true;

    while (continuarNoMenu) {
      this.mostrarOpcoes();
      const escolha = await leitorTerminal.perguntar("Escolha uma opção: ");

      if (escolha === "0") {
        continuarNoMenu = false;
        continue;
      }

      const opcaoEscolhida = this.opcoes.find((opcao) => opcao.codigo === escolha);

      if (!opcaoEscolhida) {
        console.log("\n⚠️  Opção inválida. Tente novamente.");
        continue;
      }

      await this.executarAcao(opcaoEscolhida);
    }
  }

  private mostrarOpcoes(): void {
    console.log(`\n${linhaSeparadora()}`);
    console.log(`  ${this.titulo}`);
    console.log(linhaSeparadora());
    this.opcoes.forEach((opcao) => console.log(`  ${opcao.codigo} - ${opcao.titulo}`));
    console.log(`  0 - ${this.textoSaida}`);
    console.log(linhaSeparadora());
  }

  /** Executa a ação sem deixar um erro interromper a aplicação (RF13 e RF15). */
  private async executarAcao(opcao: OpcaoMenu): Promise<void> {
    try {
      await opcao.acao();
    } catch (erro) {
      if (erro instanceof ErroDeNegocio) {
        console.log(`\n⚠️  ${erro.message}`);
      } else {
        console.log("\n❌ Ocorreu um erro inesperado. Tente novamente.");
      }
    }
  }
}