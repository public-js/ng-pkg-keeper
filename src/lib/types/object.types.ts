export type TObjectTypes = number | string;

export type TObject<T = TObjectTypes> = Record<string, T>;
