import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CheckCircle2, XCircle, Play, Code } from "lucide-react";

export interface TestAssertion {
  id: string;
  type: "status" | "header" | "body" | "time";
  field?: string;
  operator: "equals" | "contains" | "exists" | "lessThan" | "greaterThan";
  value: string;
  result?: "pass" | "fail";
}

interface TestAutomationProps {
  onRunTests: (assertions: TestAssertion[], preScript: string, testScript: string) => void;
  testResults: TestAssertion[];
}

export const TestAutomation = ({ onRunTests, testResults }: TestAutomationProps) => {
  const [assertions, setAssertions] = useState<TestAssertion[]>([]);
  const [preScript, setPreScript] = useState("");
  const [testScript, setTestScript] = useState("");

  const addAssertion = () => {
    setAssertions([
      ...assertions,
      {
        id: crypto.randomUUID(),
        type: "status",
        operator: "equals",
        value: "200",
      },
    ]);
  };

  const removeAssertion = (id: string) => {
    setAssertions(assertions.filter((a) => a.id !== id));
  };

  const updateAssertion = (id: string, updates: Partial<TestAssertion>) => {
    setAssertions(assertions.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const handleRunTests = () => {
    onRunTests(assertions, preScript, testScript);
  };

  const passedTests = testResults.filter((t) => t.result === "pass").length;
  const failedTests = testResults.filter((t) => t.result === "fail").length;

  return (
    <Card className="h-full flex flex-col border-border bg-card">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Automated Testing</h3>
          <Button
            onClick={handleRunTests}
            size="sm"
            className="bg-gradient-primary hover:opacity-90"
          >
            <Play className="w-4 h-4 mr-2" />
            Run Tests
          </Button>
        </div>
        {testResults.length > 0 && (
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm text-success">{passedTests} passed</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive">{failedTests} failed</span>
            </div>
          </div>
        )}
      </div>

      <Tabs defaultValue="assertions" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4">
          <TabsTrigger value="assertions">Assertions</TabsTrigger>
          <TabsTrigger value="pre-script">Pre-request</TabsTrigger>
          <TabsTrigger value="test-script">Test Script</TabsTrigger>
        </TabsList>

        <TabsContent value="assertions" className="flex-1 overflow-auto p-4 mt-0 space-y-4">
          <div className="space-y-2">
            {assertions.map((assertion) => {
              const result = testResults.find((t) => t.id === assertion.id);
              return (
                <div
                  key={assertion.id}
                  className={`flex gap-2 items-center p-3 rounded-lg border ${
                    result?.result === "pass"
                      ? "border-success bg-success/10"
                      : result?.result === "fail"
                      ? "border-destructive bg-destructive/10"
                      : "border-border bg-secondary"
                  }`}
                >
                  {result && (
                    result.result === "pass" ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )
                  )}
                  <Select
                    value={assertion.type}
                    onValueChange={(v) =>
                      updateAssertion(assertion.id, { type: v as TestAssertion["type"] })
                    }
                  >
                    <SelectTrigger className="w-32 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="header">Header</SelectItem>
                      <SelectItem value="body">Body</SelectItem>
                      <SelectItem value="time">Response Time</SelectItem>
                    </SelectContent>
                  </Select>

                  {(assertion.type === "header" || assertion.type === "body") && (
                    <Input
                      placeholder="Field name"
                      value={assertion.field || ""}
                      onChange={(e) =>
                        updateAssertion(assertion.id, { field: e.target.value })
                      }
                      className="w-40 bg-background"
                    />
                  )}

                  <Select
                    value={assertion.operator}
                    onValueChange={(v) =>
                      updateAssertion(assertion.id, {
                        operator: v as TestAssertion["operator"],
                      })
                    }
                  >
                    <SelectTrigger className="w-40 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="exists">Exists</SelectItem>
                      <SelectItem value="lessThan">Less Than</SelectItem>
                      <SelectItem value="greaterThan">Greater Than</SelectItem>
                    </SelectContent>
                  </Select>

                  {assertion.operator !== "exists" && (
                    <Input
                      placeholder="Expected value"
                      value={assertion.value}
                      onChange={(e) =>
                        updateAssertion(assertion.id, { value: e.target.value })
                      }
                      className="flex-1 bg-background"
                    />
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAssertion(assertion.id)}
                    className="hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
          <Button variant="outline" onClick={addAssertion} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Test Assertion
          </Button>
        </TabsContent>

        <TabsContent value="pre-script" className="flex-1 overflow-auto p-4 mt-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Code className="w-4 h-4" />
              <span>JavaScript code to run before the request</span>
            </div>
            <Textarea
              value={preScript}
              onChange={(e) => setPreScript(e.target.value)}
              placeholder="// Set variables, prepare data&#10;pm.environment.set('timestamp', Date.now());"
              className="h-[300px] font-mono text-sm bg-secondary resize-none"
            />
          </div>
        </TabsContent>

        <TabsContent value="test-script" className="flex-1 overflow-auto p-4 mt-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Code className="w-4 h-4" />
              <span>JavaScript code to validate response</span>
            </div>
            <Textarea
              value={testScript}
              onChange={(e) => setTestScript(e.target.value)}
              placeholder="// Custom test logic&#10;pm.test('Response time is acceptable', function() {&#10;  pm.expect(pm.response.responseTime).to.be.below(200);&#10;});"
              className="h-[300px] font-mono text-sm bg-secondary resize-none"
            />
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
