import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { bloodRequests } from '@/lib/data';

export default function AdminRequestsPage() {
  return (
    <div className="space-y-6">
      <h2 className="font-headline text-3xl font-bold tracking-tight">
        Blood Request Management
      </h2>
      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
          <CardDescription>
            View and manage all blood requests on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead className="hidden sm:table-cell">Location</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bloodRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.patientName}
                    </TableCell>
                    <TableCell>{request.bloodType}</TableCell>
                    <TableCell className="hidden sm:table-cell">{request.location}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.urgency === 'High'
                            ? 'destructive'
                            : request.urgency === 'Medium'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {request.urgency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.status === 'Fulfilled'
                            ? 'default'
                            : request.status === 'Pending'
                            ? 'secondary'
                            : 'outline'
                        }
                        className={request.status === 'Fulfilled' ? 'bg-green-600' : ''}
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{request.createdAt}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Mark as Fulfilled</DropdownMenuItem>
                          <DropdownMenuItem>Cancel Request</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
