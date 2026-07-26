export interface ContractFormConfig {
  type: "pawn" | "unsecured" | "installment" | "capital";
  title: string;
  showCustomer: boolean;
  showGoods: boolean;
  showLoan: boolean;
  showInterest: boolean;
  showFinance: boolean;
  showNotes: boolean;
  // Specific toggles
  allowUpfrontInterest: boolean;
  allowContractCodeManual: boolean;
}

export const contractConfigs: Record<
  "pawn" | "unsecured" | "installment" | "capital",
  ContractFormConfig
> = {
  pawn: {
    type: "pawn",
    title: "Hợp đồng cầm đồ",
    showCustomer: true,
    showGoods: true,
    showLoan: true,
    showInterest: true,
    showFinance: true,
    showNotes: true,
    allowUpfrontInterest: true,
    allowContractCodeManual: true,
  },
  unsecured: {
    type: "unsecured",
    title: "Hợp đồng tín chấp",
    showCustomer: true,
    showGoods: false,
    showLoan: true,
    showInterest: true,
    showFinance: true,
    showNotes: true,
    allowUpfrontInterest: true,
    allowContractCodeManual: true,
  },
  installment: {
    type: "installment",
    title: "Hợp đồng trả góp",
    showCustomer: true,
    showGoods: false,
    showLoan: true,
    showInterest: false,
    showFinance: true,
    showNotes: true,
    allowUpfrontInterest: true, // Used for "Thu trước 1 kỳ"
    allowContractCodeManual: true,
  },
  capital: {
    type: "capital",
    title: "Hợp đồng nguồn vốn",
    showCustomer: true,
    showGoods: false,
    showLoan: true,
    showInterest: true,
    showFinance: false,
    showNotes: true,
    allowUpfrontInterest: false,
    allowContractCodeManual: true,
  },
};
