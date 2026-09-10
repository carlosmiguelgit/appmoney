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

// Esconde 3 primeiros e 2 últimos caracteres, mantendo a formatação
export const maskPixKey = (key: string, type: string): string => {
  if (!key) return key;

  const maskByDigitsKeepingFormat = (formatted: string) => {
    const chars = formatted.split('');
    const isMaskable = (c: string) => /[0-9A-Za-z]/.test(c);
    const maskableIndices: number[] = [];
    for (let i = 0; i < chars.length; i++) {
      if (isMaskable(chars[i])) maskableIndices.push(i);
    }
    const total = maskableIndices.length;
    for (let i = 0; i < total; i++) {
      const idx = maskableIndices[i];
      if (i < 3 || i >= total - 2) {
        chars[idx] = '*';
      }
    }
    return chars.join('');
  };

  switch (type) {
    case 'cpf': {
      const digits = key.replace(/\D/g, '').slice(0, 11);
      if (digits.length === 11) {
        const formatted = digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
        return maskByDigitsKeepingFormat(formatted);
      }
      return maskByDigitsKeepingFormat(key);
    }

    case 'phone': {
      const digits = key.replace(/\D/g, '').slice(0, 11);
      if (digits.length === 11) {
        const formatted = digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        return maskByDigitsKeepingFormat(formatted);
      } else if (digits.length === 10) {
        const formatted = digits.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
        return maskByDigitsKeepingFormat(formatted);
      }
      return maskByDigitsKeepingFormat(key);
    }

    case 'email': {
      const parts = key.split('@');
      if (parts.length !== 2) return maskByDigitsKeepingFormat(key);
      const [name, domain] = parts;
      const maskedName = name
        .split('')
        .map((c, i) => (i < 3 || i >= name.length - 2 ? '*' : c))
        .join('');
      return `${maskedName}@${domain}`;
    }

    case 'random': {
      const arr = key.split('');
      const totalMaskable = arr.filter(ch => /[0-9A-Za-z]/.test(ch)).length;
      if (totalMaskable <= 0) return key;
      let seen = 0;
      return arr
        .map((ch) => {
          if (!/[0-9A-Za-z]/.test(ch)) return ch;
          const indexAmongMaskable = seen;
          seen += 1;
          if (indexAmongMaskable < 3 || indexAmongMaskable >= totalMaskable - 2) return '*';
          return ch;
        })
        .join('');
    }

    default:
      return maskByDigitsKeepingFormat(key);
  }
};