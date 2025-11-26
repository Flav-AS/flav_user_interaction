import Link from "next/link";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <main className="flex w-full max-w-4xl flex-col items-center justify-center py-16 px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            FLAV PowerBI Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage client configurations, account grouping, and access control for PowerBI reports from the POGO platform.
          </p>
        </div>

        <div className="w-full max-w-md space-y-4">
          <Link
            href="/admin"
            className="flex items-center justify-center w-full px-6 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Go to Admin Dashboard →
          </Link>
          <div className="text-center space-y-1">
            <div className="text-sm text-gray-600">
              {session?.user?.email ? `Logged in as: ${session.user.email}` : 'Running in Demo Mode'}
            </div>
            <div className="text-xs text-gray-500">
              No authentication required - direct access enabled
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-2xl font-bold mb-3">01</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Clients</h3>
            <p className="text-gray-600 text-sm">
              Create and manage client configurations with access to PowerBI reports.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-2xl font-bold mb-3">02</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Group Accounts</h3>
            <p className="text-gray-600 text-sm">
              Customize account groupings and override POGO defaults for flexible reporting.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-2xl font-bold mb-3">03</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Control Access</h3>
            <p className="text-gray-600 text-sm">
              Manage user access rights and determine who can view client reports.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
