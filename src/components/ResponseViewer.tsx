import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, FileJson } from "lucide-react";

interface ResponseViewerProps {
  response: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: any;
    time: number;
  } | null;
}

export const ResponseViewer = ({ response }: ResponseViewerProps) => {
  if (!response) {
    return (
      <Card className="h-full flex items-center justify-center border-border bg-card">
        <div className="text-center text-muted-foreground">
          <FileJson className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Send a request to see the response</p>
        </div>
      </Card>
    );
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-gradient-success";
    if (status >= 400) return "bg-gradient-danger";
    return "bg-gradient-primary";
  };

  return (
    <Card className="h-full flex flex-col border-border bg-card">
      <div className="p-4 border-b border-border flex items-center gap-4">
        <Badge className={`${getStatusColor(response.status)} text-white`}>
          {response.status} {response.statusText}
        </Badge>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{response.time}ms</span>
        </div>
      </div>

      <Tabs defaultValue="body" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4">
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
        </TabsList>

        <TabsContent value="body" className="flex-1 overflow-auto p-4 mt-0">
          <pre className="font-mono text-sm text-foreground bg-secondary p-4 rounded-lg overflow-auto">
            {typeof response.body === "string"
              ? response.body
              : JSON.stringify(response.body, null, 2)}
          </pre>
        </TabsContent>

        <TabsContent value="headers" className="flex-1 overflow-auto p-4 mt-0">
          <div className="space-y-2">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="flex gap-2 p-2 bg-secondary rounded">
                <span className="font-semibold text-primary">{key}:</span>
                <span className="text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
