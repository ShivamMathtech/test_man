import { useState, useEffect } from "react";
import { RequestBuilder, RequestConfig } from "@/components/RequestBuilder";
import { ResponseViewer } from "@/components/ResponseViewer";
import { TestAutomation, TestAssertion } from "@/components/TestAutomation";
import { EnvironmentManager, Environment } from "@/components/EnvironmentManager";
import { toast } from "sonner";
import { Zap } from "lucide-react";

const Index = () => {
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestAssertion[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [activeEnvironment, setActiveEnvironment] = useState<string | null>(null);

  // Load environments from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("api-environments");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEnvironments(parsed.environments || []);
        setActiveEnvironment(parsed.active || null);
      } catch (e) {
        console.error("Failed to load environments", e);
      }
    }
  }, []);

  // Save environments to localStorage
  useEffect(() => {
    localStorage.setItem(
      "api-environments",
      JSON.stringify({ environments, active: activeEnvironment })
    );
  }, [environments, activeEnvironment]);

  // Replace environment variables in a string
  const replaceEnvVariables = (str: string): string => {
    if (!activeEnvironment) return str;
    const env = environments.find((e) => e.id === activeEnvironment);
    if (!env) return str;

    let result = str;
    env.variables.forEach((variable) => {
      if (variable.key && variable.value) {
        result = result.replace(new RegExp(`{{${variable.key}}}`, "g"), variable.value);
      }
    });
    return result;
  };

  const handleSendRequest = async (config: RequestConfig) => {
    setIsLoading(true);
    const startTime = Date.now();

    try {
      // Replace environment variables in URL
      const urlWithVars = replaceEnvVariables(config.url);
      
      // Build URL with params
      const url = new URL(urlWithVars);
      config.params.forEach((param) => {
        const key = replaceEnvVariables(param.key);
        const value = replaceEnvVariables(param.value);
        url.searchParams.append(key, value);
      });

      // Build headers
      const headers: Record<string, string> = {};
      config.headers.forEach((header) => {
        const key = replaceEnvVariables(header.key);
        const value = replaceEnvVariables(header.value);
        headers[key] = value;
      });

      // Apply authentication
      if (config.auth.type === "bearer" && config.auth.bearerToken) {
        headers["Authorization"] = `Bearer ${replaceEnvVariables(config.auth.bearerToken)}`;
      } else if (config.auth.type === "apikey" && config.auth.apiKey && config.auth.apiKeyName) {
        if (config.auth.apiKeyLocation === "header") {
          headers[config.auth.apiKeyName] = replaceEnvVariables(config.auth.apiKey);
        } else {
          url.searchParams.append(
            config.auth.apiKeyName,
            replaceEnvVariables(config.auth.apiKey)
          );
        }
      } else if (config.auth.type === "basic" && config.auth.basicUsername && config.auth.basicPassword) {
        const credentials = btoa(
          `${replaceEnvVariables(config.auth.basicUsername)}:${replaceEnvVariables(config.auth.basicPassword)}`
        );
        headers["Authorization"] = `Basic ${credentials}`;
      } else if (config.auth.type === "oauth2" && config.auth.oauth2AccessToken) {
        const tokenType = config.auth.oauth2TokenType || "Bearer";
        headers["Authorization"] = `${tokenType} ${replaceEnvVariables(config.auth.oauth2AccessToken)}`;
      }

      // Make request with body variable replacement
      const bodyWithVars = config.body ? replaceEnvVariables(config.body) : undefined;
      const fetchResponse = await fetch(url.toString(), {
        method: config.method,
        headers,
        body: config.method !== "GET" && bodyWithVars ? bodyWithVars : undefined,
      });

      const responseTime = Date.now() - startTime;
      const responseHeaders: Record<string, string> = {};
      fetchResponse.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let body;
      const contentType = fetchResponse.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        body = await fetchResponse.json();
      } else {
        body = await fetchResponse.text();
      }

      const responseData = {
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        headers: responseHeaders,
        body,
        time: responseTime,
      };

      setResponse(responseData);
      toast.success("Request completed successfully", {
        description: `${config.method} ${config.url} - ${fetchResponse.status}`,
      });
    } catch (error) {
      toast.error("Request failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      setResponse({
        status: 0,
        statusText: "Error",
        headers: {},
        body: error instanceof Error ? error.message : "Unknown error",
        time: Date.now() - startTime,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunTests = (
    assertions: TestAssertion[],
    preScript: string,
    testScript: string
  ) => {
    if (!response) {
      toast.error("No response to test", {
        description: "Send a request first",
      });
      return;
    }

    const results = assertions.map((assertion) => {
      let result: "pass" | "fail" = "pass";

      try {
        switch (assertion.type) {
          case "status":
            if (assertion.operator === "equals") {
              result = response.status === parseInt(assertion.value) ? "pass" : "fail";
            } else if (assertion.operator === "lessThan") {
              result = response.status < parseInt(assertion.value) ? "pass" : "fail";
            } else if (assertion.operator === "greaterThan") {
              result = response.status > parseInt(assertion.value) ? "pass" : "fail";
            }
            break;

          case "header":
            const headerValue = response.headers[assertion.field || ""];
            if (assertion.operator === "exists") {
              result = headerValue !== undefined ? "pass" : "fail";
            } else if (assertion.operator === "equals") {
              result = headerValue === assertion.value ? "pass" : "fail";
            } else if (assertion.operator === "contains") {
              result = headerValue?.includes(assertion.value) ? "pass" : "fail";
            }
            break;

          case "body":
            const bodyStr = JSON.stringify(response.body);
            if (assertion.operator === "contains") {
              result = bodyStr.includes(assertion.value) ? "pass" : "fail";
            } else if (assertion.operator === "equals") {
              result = bodyStr === assertion.value ? "pass" : "fail";
            }
            break;

          case "time":
            if (assertion.operator === "lessThan") {
              result = response.time < parseInt(assertion.value) ? "pass" : "fail";
            } else if (assertion.operator === "greaterThan") {
              result = response.time > parseInt(assertion.value) ? "pass" : "fail";
            }
            break;
        }
      } catch (error) {
        result = "fail";
      }

      return { ...assertion, result };
    });

    setTestResults(results);

    const passed = results.filter((r) => r.result === "pass").length;
    const failed = results.filter((r) => r.result === "fail").length;

    if (failed === 0) {
      toast.success("All tests passed!", {
        description: `${passed} assertion(s) validated`,
      });
    } else {
      toast.error(`${failed} test(s) failed`, {
        description: `${passed} passed, ${failed} failed`,
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">API Testing Studio</h1>
              <p className="text-sm text-muted-foreground">
                Advanced automation testing platform
              </p>
            </div>
          </div>
          <EnvironmentManager
            environments={environments}
            activeEnvironment={activeEnvironment}
            onEnvironmentsChange={setEnvironments}
            onActiveEnvironmentChange={setActiveEnvironment}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto p-6 grid grid-cols-2 gap-6 overflow-hidden">
        {/* Left Panel - Request Builder */}
        <div className="flex flex-col gap-6 overflow-hidden">
          <RequestBuilder onSendRequest={handleSendRequest} isLoading={isLoading} />
        </div>

        {/* Right Panel - Response & Tests */}
        <div className="flex flex-col gap-6 overflow-hidden">
          <div className="h-1/2">
            <ResponseViewer response={response} />
          </div>
          <div className="h-1/2">
            <TestAutomation onRunTests={handleRunTests} testResults={testResults} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
