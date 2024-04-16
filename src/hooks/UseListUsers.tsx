import { useEffect, useState } from "react"

export default function UseListUsers() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<Array<{
    id: string;
    email: string;
    roles: string[];
    first_name: string;
    last_name: string;
  }>>([])

  useEffect(() => {
    setLoading(true)
    fetch(`${location.href}/api/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(res => res.json())
      .then(data => setUsers(data))
      .finally(() => setLoading(false))
  }, [])

  return { loading, users }
}