import { ConfigState } from "@/interface/index"

const CONFIG: ConfigState = {
  WS_URL: "ws://localhost:3000",
  defaultData: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: ''
  },
  logicalDelFieldOptions: ['isDelete', 'IsDelete', ' isDeleted', 'IsDeleted', 'is_delete','is_deleted'],
  intType:["int","bigint","smallint","mediumint","integer", "tinyint", "tinyint(1)"],
  primaryKeyFieldRules:['auto_increment','time_random_id','time_crypto_id'],
}
export default CONFIG