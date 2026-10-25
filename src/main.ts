import { AutorController } from "./controllers/AutorController";
import { LivroController } from "./controllers/LivroController";
import { criarMenuAutores } from "./menus/menuAutores";
import { criarMenuLivros } from "./menus/menuLivros";
import { criarMenuPrincipal } from "./menus/menuPrincipal";
import { AutorRepository } from "./repositories/AutorRepository";
import { LivroRepository } from "./repositories/LivroRepository";
import { AutorService } from "./services/AutorService";
import { LivroService } from "./services/LivroService";
import { leitorTerminal } from "./utils/leitorTerminal";

async function moduloEmConstrucao(nomeDoModulo: string): Promise<void> {
  console.log(`\n🚧 O módulo "${nomeDoModulo}" ainda está em construção.`);
  await leitorTerminal.aguardarEnter();
}

async function iniciar(): Promise<void> {
  const autorRepository = new AutorRepository();
  const livroRepository = new LivroRepository();

  const autorService = new AutorService(autorRepository, livroRepository);
  const livroService = new LivroService(livroRepository, autorService);

  const autorController = new AutorController(autorService);
  const livroController = new LivroController(livroService, autorService);

  const menuAutores = criarMenuAutores(autorController);
  const menuLivros = criarMenuLivros(livroController);

  const menuPrincipal = criarMenuPrincipal({
    abrirAutores: () => menuAutores.exibir(),
    abrirLivros: () => menuLivros.exibir(),
    abrirClientes: () => moduloEmConstrucao("Clientes"),
    abrirEmprestimos: () => moduloEmConstrucao("Empréstimos"),
  });

  await menuPrincipal.exibir();

  console.log("\n👋 Aplicação encerrada. Até logo!");
  leitorTerminal.fechar();
}

iniciar();