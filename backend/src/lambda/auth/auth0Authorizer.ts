import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

//DONE
// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-w9xtyg54.us.auth0.com/.well-known/jwks.json'

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJMuJqwTcwer2zMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi13OXh0eWc1NC51cy5hdXRoMC5jb20wHhcNMjIxMDAxMTkxODE3WhcN
MzYwNjA5MTkxODE3WjAkMSIwIAYDVQQDExlkZXYtdzl4dHlnNTQudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA9qcqM1vAcRHhVhg5
1z9Y2FkZW3pBEY9khw39uCLJA8YaPHH0yjU4HUfmdRBboBx2PG+V6ecLx6ijxlWs
BR+BPwh4GJNzQnbwvvbElQSwLpxHz68wA25J5b5kYqD0yVuTvJb9d4KQSXWt/2QH
AxzTpm6bzv41gx3ctNB4GzpAbT0ehZUYAtFs9ZPBy6ZmPHPXrdoP/p0hsF9BTvi0
pwyq3vUr3NX/Zu3llloYt2PiKrcOd3zOpkBvSkvojfIzax9xY/uhtNISUpwrJCp2
18IH1vXw9l31XL+rrgu9zySQ4NB3b5QspMNGhKjuLcbevHvk9r19saOvuHZ0kEE5
CC5LfQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRVCf9P4j0w
yfEVIfNaS/a/EQDQUTAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AFvVVp8TtC+aJLN4A3cV31AyOFDFL0WVPqzEmNRgfkmh4jCmHwyzAOy7+CmaUif/
s1TWUBPE54sMFhqS5O0g3Ro/PKZ7OySissNX2i+d4eOhi/qM6ffj6kc7DHioYCL9
v8ab26+mEDNmBMQqxBKEQ/DgM8AZNXf2d4a6eXu0sAWDh7yMFZAmYQSGxdHhqJ77
q5F89WFlLN3HfnE95inOfwjyWBFkcpcV43OwBcHLF5+je7wUqvfzJGh/oB1TSPyf
7ao8WAj0P3epfQzYPjE3693ZYsbCT4koLSviO4VOiWNqed3ZwJg1lbeOzBMIsn+R
vNJPxyQrlQTHcbP3NArP+B4=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification (DONE)
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token,cert,{ algorithms:["RS256"]}) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
