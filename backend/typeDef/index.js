import { mergeTypeDefs } from "@graphql-tools/merge";

// typeDefs
import userTypeDef from "./usertypeDef.js";
import transactionTypeDef from "./transactiontypeDef.js";

const mergedTypeDefs = mergeTypeDefs([userTypeDef, transactionTypeDef]);

export default mergedTypeDefs;