/**
 * Erro lançado quando uma regra de negócio é violada.
 * Exemplos: livro indisponível, cliente inexistente, registro duplicado.
 */
export class ErroDeNegocio extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroDeNegocio";
    Object.setPrototypeOf(this, ErroDeNegocio.prototype);
  }
}