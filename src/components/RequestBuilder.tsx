import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Play, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AuthenticationTab, AuthConfig } from "./AuthenticationTab";

interface RequestBuilderProps {
  onSendRequest: (config: RequestConfig) => void;
  isLoading?: boolean;
}

export interface RequestConfig {
  method: string;
  url: string;
  headers: Array<{ key: string; value: string }>;
  body: string;
  params: Array<{ key: string; value: string }>;
  auth: AuthConfig;
}

export const RequestBuilder = ({ onSendRequest, isLoading }: RequestBuilderProps) => {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([{ key: "", value: "" }]);
  const [body, setBody] = useState("");
  const [params, setParams] = useState<Array<{ key: string; value: string }>>([{ key: "", value: "" }]);
  const [auth, setAuth] = useState<AuthConfig>({ type: "none" });

  const handleSend = () => {
    onSendRequest({
      method,
      url,
      headers: headers.filter(h => h.key),
      body,
      params: params.filter(p => p.key),
      auth,
    });
  };

  const addHeader = () => setHeaders([...headers, { key: "", value: "" }]);
  const removeHeader = (index: number) => setHeaders(headers.filter((_, i) => i !== index));
  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const addParam = () => setParams([...params, { key: "", value: "" }]);
  const removeParam = (index: number) => setParams(params.filter((_, i) => i !== index));
  const updateParam = (index: number, field: "key" | "value", value: string) => {
    const newParams = [...params];
    newParams[index][field] = value;
    setParams(newParams);
  };

  return (
    <Card className="h-full flex flex-col border-border bg-card">
      <div className="p-4 border-b border-border">
        <div className="flex gap-2 mb-4">
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="w-32 bg-secondary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter request URL"
            className="flex-1 bg-secondary"
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !url}
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            <Play className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>
      </div>

      <Tabs defaultValue="params" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4">
          <TabsTrigger value="params">Params</TabsTrigger>
          <TabsTrigger value="auth">Auth</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
          <TabsTrigger value="body">Body</TabsTrigger>
        </TabsList>

        <TabsContent value="params" className="flex-1 overflow-auto p-4 mt-0">
          <div className="space-y-2">
            {params.map((param, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Key"
                  value={param.key}
                  onChange={(e) => updateParam(index, "key", e.target.value)}
                  className="bg-secondary"
                />
                <Input
                  placeholder="Value"
                  value={param.value}
                  onChange={(e) => updateParam(index, "value", e.target.value)}
                  className="bg-secondary"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeParam(index)}
                  className="hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addParam} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Parameter
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="auth" className="flex-1 overflow-auto p-4 mt-0">
          <AuthenticationTab authConfig={auth} onAuthChange={setAuth} />
        </TabsContent>

        <TabsContent value="headers" className="flex-1 overflow-auto p-4 mt-0">
          <div className="space-y-2">
            {headers.map((header, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Key"
                  value={header.key}
                  onChange={(e) => updateHeader(index, "key", e.target.value)}
                  className="bg-secondary"
                />
                <Input
                  placeholder="Value"
                  value={header.value}
                  onChange={(e) => updateHeader(index, "value", e.target.value)}
                  className="bg-secondary"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeHeader(index)}
                  className="hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addHeader} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Header
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="body" className="flex-1 overflow-auto p-4 mt-0">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Request body (JSON, XML, etc.)"
            className="h-full min-h-[200px] font-mono text-sm bg-secondary resize-none"
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
};
