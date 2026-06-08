import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function Main() {
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    const res = await fetch(`/api/proj-live-20260608-003438/health`);
    const data = await res.json();
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proj Live 20260608 003438</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleAction} disabled={loading}>
          {loading ? "Loading..." : "Check Health"}
        </Button>
      </CardContent>
    </Card>
  );
}
