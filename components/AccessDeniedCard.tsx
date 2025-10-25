import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export default function AccessDeniedCard() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You do not have permission to access this resource
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          Please contact your administrator if you believe this is an error.
        </CardContent>
      </Card>
    </div>
  );
}
