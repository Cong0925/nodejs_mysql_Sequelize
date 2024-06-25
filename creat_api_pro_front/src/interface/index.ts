export interface defaultDataState {
  host: string
  port: number
  user: string
  password: string
  database: string
}

export interface ConfigState {
  WS_URL: string
  defaultData: defaultDataState,
  logicalDelFieldOptions: Array<string>
  intType: Array<string>
  primaryKeyFieldRules: Array<string>
}

export interface SqlDatabasesState {
  Database: string
}

export interface FieldState {
  Default: null | string
  Extra: string
  Field: string
  Key: string
  Null: string
  Type: string
}



