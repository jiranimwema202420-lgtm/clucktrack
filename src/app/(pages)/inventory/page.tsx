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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockFlocks } from '@/lib/data';
import { PlusCircle, MinusCircle } from 'lucide-react';

export default function InventoryPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Flock Inventory</CardTitle>
                <CardDescription>
                An overview of all active flocks on the farm.
                </CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline">
                    <MinusCircle className="mr-2 h-4 w-4" />
                    Record Loss
                </Button>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Chicks
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Flock ID</TableHead>
              <TableHead>Breed</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Age (Weeks)</TableHead>
              <TableHead className="text-right">Avg. Weight (kg)</TableHead>
              <TableHead>Hatch Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockFlocks.map((flock) => (
              <TableRow key={flock.id}>
                <TableCell className="font-medium">
                  <Badge variant="secondary">{flock.id}</Badge>
                </TableCell>
                <TableCell>{flock.breed}</TableCell>
                <TableCell className="text-right">{flock.count.toLocaleString()}</TableCell>
                <TableCell className="text-right">{flock.age}</TableCell>
                <TableCell className="text-right">{flock.averageWeight.toFixed(2)}</TableCell>
                <TableCell>{flock.hatchDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
