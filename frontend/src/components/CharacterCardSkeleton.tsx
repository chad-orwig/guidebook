import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CharacterCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-2 w-full" />

      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>

      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>

      <CardFooter className="gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </CardFooter>
    </Card>
  );
}
