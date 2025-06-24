import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle } from "lucide-react";

export default function AuthoritiesPage() {
  // Mock data - replace with API calls
  const authorities = [
    {
      id: "AUTH-001",
      name: "Nakuru Land Registry",
      jurisdiction: "Nakuru County",
      contact: "registry@nakuru.go.ke",
      status: "Active",
    },
    {
      id: "AUTH-002",
      name: "Kenya Agriculture Board",
      jurisdiction: "National",
      contact: "kab@agriculture.go.ke",
      status: "Pending",
    },
    {
      id: "AUTH-003",
      name: "Land Verification Service",
      jurisdiction: "Central Region",
      contact: "info@landverify.co.ke",
      status: "Active",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Government Authorities</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Authority
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Verification Authorities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <Input placeholder="Search authorities..." className="flex-1" />
            <div className="flex space-x-2">
              <Button variant="outline">Filter</Button>
              <Button variant="outline">Sort</Button>
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Jurisdiction</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {authorities.map((auth) => (
                  <TableRow key={auth.id}>
                    <TableCell className="font-medium">{auth.name}</TableCell>
                    <TableCell>{auth.jurisdiction}</TableCell>
                    <TableCell>{auth.contact}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          auth.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {auth.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Add Authority Form (Would be in a modal in real implementation) */}
          <div className="mt-6 p-4 border rounded-lg">
            <h3 className="text-lg font-medium mb-4">Onboard New Authority</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input placeholder="Authority Name" />
              <Input placeholder="Jurisdiction" />
              <Input placeholder="Contact Email" type="email" />
              <Input placeholder="Contact Phone" type="tel" />
              <div className="sm:col-span-2">
                <Button>Submit Authority Request</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
