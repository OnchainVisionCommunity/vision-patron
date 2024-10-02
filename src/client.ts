import { createThirdwebClient } from "thirdweb";

// Replace this with your client ID string
// refer to https://portal.thirdweb.com/typescript/v5/client on how to get a client ID
//const clientId = import.meta.env.VITE_TEMPLATE_CLIENT_ID;
const clientId = "366e48f6dbd1b1874ee2ccad727607a2";

export const client = createThirdwebClient({
  clientId: clientId,
});
