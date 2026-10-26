import { AutorController } from "./controllers/AutorController";
import { ClienteController } from "./controllers/ClienteController";
import { EmprestimoController } from "./controllers/EmprestimoController";
import { LivroController } from "./controllers/LivroController";
import { carregarDadosIniciais } from "./data/seed";
import { criarMenuAutores } from "./menus/menuAutores";
import { criarMenuClientes } from "./menus/menuClientes";
import { criarMenuEmprestimos } from "./menus/menuEmprestimos";
import { criarMenuLivros } from "./menus/menuLivros";
import { criarMenuPrincipal } from "./menus/menuPrincipal";
import { AutorRepository } from "./repositories/AutorRepository";
import { ClienteRepository } from "./repositories/ClienteRepository";
import { EmprestimoRepository } from "./repositories/EmprestimoRepository";
import { LivroRepository } from "./repositories/LivroRepository";
import { AutorService } from "./services/AutorService";
import { ClienteService } from "./services/ClienteService";
import { EmprestimoService } from "./services/EmprestimoService";
import { LivroService } from "./services/LivroService";
import { leitorTerminal } from "./utils/leitorTerminal";

/** Ponto de entrada: monta as camadas, carrega o seed e inicia o menu principal. */
async function iniciar(): Promise<void> {
  const autorRepository = new AutorRepository();
  const livroRepository = new LivroRepository();
  const clienteRepository = new ClienteRepository();
  const emprestimoRepository = new EmprestimoRepository();

  await carregarDadosIniciais({ autorRepository, livroRepository, clienteRepository, emprestimoRepository });

  const autorService = new AutorService(autorRepository, livroRepository);
  const livroService = new LivroService(livroRepository, autorService, emprestimoRepository);
  const clienteService = new ClienteService(clienteRepository, emprestimoRepository);
  const emprestimoService = new EmprestimoService(emprestimoRepository, livroService, clienteService);

  const autorController = new AutorController(autorService);
  const livroController = new LivroController(livroService, autorService);
  const clienteController = new ClienteController(clienteService);
  const emprestimoController = new EmprestimoController(emprestimoService, livroService, clienteService);

  const menuAutores = criarMenuAutores(autorController);
  const menuLivros = criarMenuLivros(livroController);
  const menuClientes = criarMenuClientes(clienteController);
  const menuEmprestimos = criarMenuEmprestimos(emprestimoController);

  const menuPrincipal = criarMenuPrincipal({
    abrirAutores: () => menuAutores.exibir(),
    abrirLivros: () => menuLivros.exibir(),
    abrirClientes: () => menuClientes.exibir(),
    abrirEmprestimos: () => menuEmprestimos.exibir(),
  });

  console.log("\n📚 BookStore Manager CLI iniciado! Dados iniciais carregados.");
  await menuPrincipal.exibir();

  console.log("\n👋 Aplicação encerrada. Até logo!");
  leitorTerminal.fechar();
}

iniciar().catch((erro) => {
  console.error("❌ Erro fatal ao iniciar a aplicação:", erro);
  leitorTerminal.fechar();
  process.exit(1);
});