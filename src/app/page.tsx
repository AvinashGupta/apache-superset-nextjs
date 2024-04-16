'use client'

import { embedDashboard } from "@superset-ui/embedded-sdk";
import { useCallback, useEffect, useRef, useState, FormEvent } from "react";

const SUPERSET_DOMAIN = process.env.SUPERSET_DOMAIN || ''
const DEFAULT_DASHBOARD_ID = process.env.DEFAULT_DASHBOARD_ID || ''
const DEFAULT_CUSTOMER_ID = process.env.DEFAULT_CUSTOMER_ID || ''

interface DashboardParams {
  dashboardId: string;
  customerId: string;
}

async function fetchGuestTokenFromBackend(dashboardId: string) {
  const loginRes = await fetch(`${location.href}/api/guestToken?dashboardId=${dashboardId}`, {
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
  const customerIdRef = useRef<HTMLInputElement>(null)
  const [dashboardParams, setDashboardParams] = useState<DashboardParams>({
    dashboardId: '',
    customerId: ''
  })
  
  const onDashboardReload = useCallback((event?: FormEvent) => {
    event?.preventDefault();

    setDashboardParams((prev) => ({
      ...prev,
      dashboardId: dashboardIdRef.current?.value || '',
      customerId: customerIdRef.current?.value || ''
    }))
  }, [dashboardIdRef, customerIdRef])

  useEffect(() => {
    if (!elementRef.current || !dashboardParams.dashboardId) return;

    embedDashboard({
      id: dashboardParams.dashboardId,
      supersetDomain: SUPERSET_DOMAIN,
      mountPoint: elementRef.current,
      fetchGuestToken: () => fetchGuestTokenFromBackend(dashboardParams.dashboardId),
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
    if (!dashboardIdRef?.current || !customerIdRef?.current) return;
    
    dashboardIdRef.current.value = DEFAULT_DASHBOARD_ID
    customerIdRef.current.value = DEFAULT_CUSTOMER_ID

    onDashboardReload()
  }, [onDashboardReload, dashboardIdRef, customerIdRef])

  return (
    <main className="flex h-screen flex-col">
      <div className="control-container h-50 shadow-md z-10 p-3">
        <div className="flex flex-wrap w-full">
          <form className="w-full" onSubmit={onDashboardReload}>
            <div className="grid grid-cols-4 md:grid-cols-12 gap-3">
              <div className="flex items-center col-span-8">
                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                  <div className="flex items-center">
                    <label
                      className="font-bold mb-1 md:mb-0 whitespace-nowrap mr-1"
                      htmlFor="dashboard-id"
                    >Dashboard Id</label>
                  </div>
                  <div className="flex items-center col-span-3">
                    <input
                      ref={dashboardIdRef}
                      type="text"
                      id="dashboard-id"
                      className="text-sm rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      placeholder="dashboard id.."
                    />
                  </div>
                  <div className="flex items-center">
                    <label
                      className="block font-bold mb-1 md:mb-0 whitespace-nowrap mr-1"
                      htmlFor="customer-id"
                    >Customer Id</label>
                  </div>
                  <div className="flex items-center col-span-3">
                    <input
                      ref={customerIdRef}
                      type="text"
                      id="customer-id"
                      className="text-sm rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      placeholder="customer id.."
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-right col-span-4 flex-row-reverse">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
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
