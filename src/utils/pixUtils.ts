const firstNames = [
  'Ana', 'João', 'Maria', 'Pedro', 'Lucas', 'Julia', 'Carlos', 'Beatriz',
  'Rafael', 'Fernanda', 'Bruno', 'Camila', 'Felipe', 'Amanda', 'Thiago',
  'Mariana', 'Diego', 'Larissa', 'Gabriel', 'Patricia', 'Rodrigo', 'Juliana',
  'Marcelo', 'Adriana', 'Ricardo', 'Renata', 'Vinicius', 'Tatiana', 'Eduardo',
  'Cristina', 'Roberto', 'Sandra', 'André', 'Monica',
  'Eduarda', 'Gustavo', 'Isabela', 'Mateus', 'Letícia', 'Nathan', 'Carol',
  'Rafaela', 'Henrique', 'Bianca', 'Sérgio', 'Natália', 'Paulo', 'Lívia',
  'Caio', 'Helena', 'Vitor', 'Danilo', 'Yasmin', 'Leandro'
];

const middleNames = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Costa', 'Alves', 'Pereira',
  'Gomes', 'Ribeiro', 'Martins', 'Carvalho', 'Rocha', 'Almeida', 'Nascimento',
  'das Chagas', 'de Melo', 'das Graças', 'da Silva', 'de Souza', 'dos Santos',
  'de Oliveira', 'da Costa', 'do Nascimento', 'de Almeida', 'das Neves',
  'da Conceição', 'do Carmo', 'de Jesus', 'da Luz', 'do Prado', 'da Mata',
  'de Andrade', 'de Farias', 'de Brito', 'de Queiroz', 'dos Anjos', 'de Azevedo',
  'de Moraes', 'de Freitas', 'de Lima', 'da Paz', 'de Castro', 'de Aguiar',
  'de Sá', 'da Penha'
];

const lastNames = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves',
  'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho',
  'Rocha', 'Almeida', 'Nascimento', 'Araújo', 'Melo', 'Barbosa', 'Cardoso',
  'Castro', 'Teixeira', 'Moreira', 'Monteiro', 'Ramos', 'Dias', 'Fernandes',
  'Pinto', 'Francisco', 'Apolinário', 'Chagas',
  'Mendes', 'Tavares', 'Vieira', 'Batista', 'Campos', 'Rezende', 'Moraes',
  'Freitas', 'Barros', 'Peixoto', 'Braga', 'Assis', 'Leite', 'Queiroz',
  'Borges', 'Figueiredo', 'Coelho', 'Neves', 'Pacheco', 'Gonçalves'
];

const banks = [
  '001 — Banco do Brasil',
  '237 — Bradesco',
  '341 — Itaú Unibanco',
  '104 — Caixa Econômica Federal',
  '033 — Santander',
  '260 — Nu Pagamentos S.A (Nubank)',
  '077 — Banco Inter',
  '212 — Banco Original',
  '290 — PagSeguro',
  '323 — Mercado Pago',
  '336 — C6 Bank',
  '380 — PicPay',
  '403 — Cora',
  '422 — Safra',
  '655 — Neon',
  '735 — Neon Pagamentos',
  '197 — Stone Pagamentos'
];

export const generateRandomName = (): string => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const nameLength = Math.floor(Math.random() * 3) + 2; // 2 to 4 names
  
  const names = [firstName];
  
  for (let i = 1; i < nameLength - 1; i++) {
    names.push(middleNames[Math.floor(Math.random() * middleNames.length)]);
  }
  
  names.push(lastNames[Math.floor(Math.random() * lastNames.length)]);
  
  return names.join(' ');
};

export const generateRandomBank = (): string => {
  return banks[Math.floor(Math.random() * banks.length)];
};

export const formatPixKey = (key: string, type: string): string => {
  const numbers = key.replace(/\D/g, '');
  
  if (type === 'cpf' && numbers.length === 11) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
  }
  
  if (type === 'phone' && numbers.length === 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }
  
  return key;
};

export const formatCurrency = (value: number): string => {
  // value is expected in cents (integer)
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value / 100);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};