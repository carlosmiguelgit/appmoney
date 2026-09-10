export type PixKeyType = 'cpf' | 'phone' | 'email' | 'random' | 'unknown';

export interface Loan {
  id: string;
  amount: number; // Stored in cents
  date: Date;
}

export interface Transaction {
  id:string;
  type: 'pix-sent' | 'pix-received';
  amount: number; // Stored in cents
  recipientName: string;
  recipientKey: string;
  recipientKeyType: PixKeyType;
  recipientBank?: string;
  date: Date;
  description: string;
}

export interface BankAccount {
  balance: number; // Stored in cents
  hideBalance: boolean;
  creditLimit: number; // Stored in cents
  themeColor?: string; // HSL value for primary
  containerColor?: string; // HSL value for backgrounds
}