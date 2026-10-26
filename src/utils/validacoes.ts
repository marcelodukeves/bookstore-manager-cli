import { ErroDeNegocio } from "./ErroDeNegocio";

/** Garante que o texto não esteja vazio e devolve o valor sem espaços nas pontas. */
export function validarTextoObrigatorio(valor: string, nomeDoCampo: string): string {
  const texto = valor.trim();
  if (texto.length === 0) {
    throw new ErroDeNegocio(`O campo "${nomeDoCampo}" é obrigatório.`);
  }
  return texto;
}

/** Garante que o valor seja um número inteiro maior que zero. */
export function validarInteiroPositivo(valor: string, nomeDoCampo: string): number {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new ErroDeNegocio(`O campo "${nomeDoCampo}" deve ser um número inteiro maior que zero.`);
  }
  return numero;
}

/** Garante que o valor seja um número inteiro maior ou igual a zero. */
export function validarInteiroNaoNegativo(valor: string, nomeDoCampo: string): number {
  const numero = Number(valor);
  if (valor.trim() === "" || !Number.isInteger(numero) || numero < 0) {
    throw new ErroDeNegocio(`O campo "${nomeDoCampo}" deve ser um número inteiro maior ou igual a zero.`);
  }
  return numero;
}

/** Garante que o e-mail tenha um formato válido e o devolve em minúsculas. */
export function validarEmail(valor: string): string {
  const email = valor.trim().toLowerCase();
  const formatoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!formatoValido) {
    throw new ErroDeNegocio("O e-mail informado é inválido.");
  }
  return email;
}

/** Garante que o ano de publicação esteja entre 1000 e o ano atual. */
export function validarAnoPublicacao(valor: string): number {
  const ano = validarInteiroPositivo(valor, "Ano de publicação");
  const anoAtual = new Date().getFullYear();
  if (ano < 1000 || ano > anoAtual) {
    throw new ErroDeNegocio(`O ano de publicação deve estar entre 1000 e ${anoAtual}.`);
  }
  return ano;
}