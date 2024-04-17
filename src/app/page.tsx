'use client'

import UseListUsers from "@/hooks/UseListUsers";
import { embedDashboard } from "@superset-ui/embedded-sdk";
import { useCallback, useEffect, useRef, useState, FormEvent, use } from "react";

const SUPERSET_DOMAIN = process.env.SUPERSET_DOMAIN || ''
const DEFAULT_DASHBOARD_ID = process.env.DEFAULT_DASHBOARD_ID || ''

interface DashboardParams {
  dashboardId: string;
  companyName: string;
  userId: string;
}

async function fetchGuestTokenFromBackend({
  dashboardId,
  userId
}: DashboardParams) {
  const url = `${location.href}/api/guestToken?dashboardId=${dashboardId}&userId=${userId}`
  const loginRes = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
  const { guestToken } = await loginRes.json()
  return guestToken
}

export default function Home() {
  const elementRef = useRef<HTMLDivElement>(null)
  const dashboardIdRef = useRef<HTMLInputElement>(null)
  const companyNameRef = useRef<HTMLInputElement>(null)
  const userIdRef = useRef<HTMLSelectElement>(null)
  const [dashboardParams, setDashboardParams] = useState<DashboardParams>({
    dashboardId: '',
    companyName: '',
    userId: ''
  })
  
  const {users, loading } = UseListUsers();
  
  const onDashboardReload = useCallback((event?: FormEvent) => {
    event?.preventDefault();

    setDashboardParams((prev) => ({
      ...prev,
      dashboardId: dashboardIdRef.current?.value || '',
      companyName: companyNameRef.current?.value || '',
      userId: userIdRef.current?.value || '',
    }))
  }, [dashboardIdRef, companyNameRef])

  useEffect(() => {
    if (
      !elementRef.current ||
      !dashboardParams.dashboardId ||
      !dashboardParams.userId
    ) return;

    embedDashboard({
      id: dashboardParams.dashboardId,
      supersetDomain: SUPERSET_DOMAIN,
      mountPoint: elementRef.current,
      fetchGuestToken: () => fetchGuestTokenFromBackend(dashboardParams),
      dashboardUiConfig: {
        hideTitle: true,
        hideChartControls: true,
        hideTab: true,
        filters: {
          visible: false,
          expanded: false,
        },
        urlParams: {
          ...dashboardParams,
          show_filters: 0
        }
      },
    });
  }, [elementRef, dashboardParams])
  
  // Init
  useEffect(() => {
    if (
      !dashboardIdRef?.current ||
      !userIdRef?.current ||
      !users.length
    ) return;
    
    dashboardIdRef.current.value = DEFAULT_DASHBOARD_ID
    userIdRef.current.value = users[0].id

    onDashboardReload()
  }, [onDashboardReload, dashboardIdRef, users])

  return (
    <main className="flex h-screen flex-col">
      <div className="control-container h-50 shadow-md z-10 p-3">
        <div className="flex flex-wrap w-full">
          <form className="w-full" onSubmit={onDashboardReload}>
            <div className="grid grid-cols-4 md:grid-cols-12 gap-3">
              <div className="flex items-center col-span-10">
                <div className="grid grid-cols-4 md:grid-cols-12 gap-3 w-full">
                  <div className="flex items-center justify-end">
                    <label
                      className="font-bold mb-1 md:mb-0 whitespace-nowrap mr-0 text-sm"
                      htmlFor="dashboard-id"
                    >Dashboard</label>
                  </div>
                  <div className="flex items-center col-span-3">
                    <input
                      ref={dashboardIdRef}
                      type="text"
                      id="dashboard-id"
                      className="text-sm rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                      placeholder="dashboard id.."
                    />
                  </div>
                  <div className="flex items-center justify-end">
                    <label
                      className="block font-bold mb-1 md:mb-0 whitespace-nowrap mr-0 text-sm"
                      htmlFor="user-id"
                    >User Id</label>
                  </div>
                  <div className="flex items-center col-span-3">
                    <select
                      ref={userIdRef}
                      id="user-id"
                      defaultValue={''}
                      className="text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                    >
                      <option value={''}>Select a user</option>
                      {users.map((user, i) => (
                        <option
                          selected={i==0}
                          key={user.id}
                          value={user.id}
                        >
                          {user.first_name} {user.last_name} - {user.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center col-span-3">
                    <input
                      ref={companyNameRef}
                      type="text"
                      id="company-name"
                      className="text-sm rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                      placeholder="company name.."
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-right col-span-2 flex-row-reverse">
                <button
                  type="submit"
                  disabled={loading || !userIdRef?.current?.value || !dashboardIdRef?.current?.value}
                  className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:bg-slate-300 text-sm"
                >
                  Reload Dashboard
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="superset-container flex-1" ref={elementRef} />
    </main>
  );
}
