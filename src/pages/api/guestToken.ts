import type { NextApiRequest, NextApiResponse } from 'next'
const {
  SUPERSET_DOMAIN,
  SUPERSET_USER,
  SUPERSET_PASSWORD
} = process.env

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { dashboardId } = req.query

  try {
    // Superset Login
    const apiRes = await fetch(`${SUPERSET_DOMAIN}/api/v1/security/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "password": SUPERSET_PASSWORD,
        "provider": "db",
        "refresh": true,
        "username": SUPERSET_USER
      }),
    })
    const { access_token: accessToken } = await apiRes.json()

    // Fetch CSRF token
    const csrfTokenRes = await fetch(`${SUPERSET_DOMAIN}/api/v1/security/csrf_token/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
    })
    const { result: csrfToken } = await csrfTokenRes.json()
    const csrfTokenCookies = csrfTokenRes.headers.get('Set-Cookie') || '';
    
    // Fetch guest token with limited access
    const guestTokenRes = await fetch(`${SUPERSET_DOMAIN}/api/v1/security/guest_token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "X-CSRFToken": csrfToken,
        "Cookie": csrfTokenCookies
      },
      body: JSON.stringify({
        "resources": [
          {
            "id": dashboardId,
            "type": "dashboard"
          }
        ],
        "rls": [],
        "user": {
          "first_name": "guest",
          "last_name": "guest",
          "username": "guest"
        }
      }),
    })
    const { token: guestToken } = await guestTokenRes.json();

    res.status(200).json({ guestToken })
  } catch (err) {
    res.status(500).send({ error: err })
    throw err
  }
}