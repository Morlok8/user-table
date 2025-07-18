export interface LabelItem {
  text: string;
}

export type AccountType = 'LDAP' | 'Local';

export interface Account {
id: string;
labels: LabelItem[];
type: AccountType;
login: string;
password: string | null;
}

export interface AccountForm {
  labelsInput: string;
  type: AccountType;
  login: string;
  password: string;
}

