import { criarMenuPrincipal } from "./menus/menuPrincipal";
import { leitorTerminal } from "./utils/leitorTerminal";

async function moduloEmConstrucao(nomeDoModulo: string): Promise<void> {
  console.log(`\n🚧 O módulo "${nomeDoModulo}" ainda está em construção.`);
  await leitorTerminal.aguardarEnter();
}

async function iniciar(): Promise<void> {
  const menuPrincipal = criarMenuPrincipal({
    abrirAutores: () => moduloEmConstrucao("Autores"),
    abrirLivros: () => moduloEmConstrucao("Livros"),
    abrirClientes: () => moduloEmConstrucao("Clientes"),
    abrirEmprestimos: () => moduloEmConstrucao("Empréstimos"),
  });

  await menuPrincipal.exibir();

  console.log("\n👋 Aplicação encerrada. Até logo!");
  leitorTerminal.fechar();
}

iniciar();