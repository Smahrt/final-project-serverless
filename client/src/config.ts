// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'kbm0e8aq3h'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  domain: 'dev-k1n0gtqp.us.auth0.com',            // Auth0 domain
  clientId: 'tXZ7scEacvV0jSWfYmOYaCKAaKLRN7YN',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
