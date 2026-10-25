import { AutorController } from "./controllers/AutorController";
import { ClienteController } from "./controllers/ClienteController";
import { LivroController } from "./controllers/LivroController";
import { criarMenuAutores } from "./menus/menuAutores";
import { criarMenuClientes } from "./menus/menuClientes";
import { criarMenuLivros } from "./menus/menuLivros";
import { criarMenuPrincipal } from "./menus/menuPrincipal";
import { AutorRepository } from "./repositories/AutorRepository";
import { ClienteRepository } from "./repositories/ClienteRepository";
import { EmprestimoRepository } from "./repositories/EmprestimoRepository";
import { LivroRepository } from "./repositories/LivroRepository";
import { AutorService } from "./services/AutorService";
import { ClienteService } from "./services/ClienteService";
import { LivroService } from "./services/LivroService";
import { leitorTerminal } from "./utils/leitorTerminal";

async function moduloEmConstrucao(nomeDoModulo: string): Promise<void> {
  console.log(`\n🚧 O módulo "${nomeDoModulo}" ainda está em construção.`);
  await leitorTerminal.aguardarEnter();
}

async function iniciar(): Promise<void> {
  const autorRepository = new AutorRepository();
  const livroRepository = new LivroRepository();
  const clienteRepository = new ClienteRepository();
  const emprestimoRepository = new EmprestimoRepository();

  const autorService = new AutorService(autorRepository, livroRepository);
  const livroService = new LivroService(livroRepository, autorService, emprestimoRepository);
  const clienteService = new ClienteService(clienteRepository, emprestimoRepository);

  const autorController = new AutorController(autorService);
  const livroController = new LivroController(livroService, autorService);
  const clienteController = new ClienteController(clienteService);

  const menuAutores = criarMenuAutores(autorController);
  const menuLivros = criarMenuLivros(livroController);
  const menuClientes = criarMenuClientes(clienteController);

  const menuPrincipal = criarMenuPrincipal({
    abrirAutores: () => menuAutores.exibir(),
    abrirLivros: () => menuLivros.exibir(),
    abrirClientes: () => menuClientes.exibir(),
    abrirEmprestimos: () => moduloEmConstrucao("Empréstimos"),
  });

  await menuPrincipal.exibir();

  console.log("\n👋 Aplicação encerrada. Até logo!");
  leitorTerminal.fechar();
}

iniciar();