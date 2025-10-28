import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Key, Lock, Shield } from "lucide-react";

export interface AuthConfig {
  type: "none" | "bearer" | "apikey" | "basic" | "oauth2";
  bearerToken?: string;
  apiKey?: string;
  apiKeyLocation?: "header" | "query";
  apiKeyName?: string;
  basicUsername?: string;
  basicPassword?: string;
  oauth2AccessToken?: string;
  oauth2TokenType?: string;
}

interface AuthenticationTabProps {
  authConfig: AuthConfig;
  onAuthChange: (config: AuthConfig) => void;
}

export const AuthenticationTab = ({ authConfig, onAuthChange }: AuthenticationTabProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const updateAuth = (updates: Partial<AuthConfig>) => {
    onAuthChange({ ...authConfig, ...updates });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Authentication</h3>
      </div>

      <div className="space-y-2">
        <Label>Auth Type</Label>
        <Select value={authConfig.type} onValueChange={(v) => updateAuth({ type: v as AuthConfig["type"] })}>
          <SelectTrigger className="bg-secondary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Auth</SelectItem>
            <SelectItem value="bearer">Bearer Token</SelectItem>
            <SelectItem value="apikey">API Key</SelectItem>
            <SelectItem value="basic">Basic Auth</SelectItem>
            <SelectItem value="oauth2">OAuth 2.0</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {authConfig.type === "bearer" && (
        <div className="space-y-4 p-4 bg-secondary rounded-lg border border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Key className="w-4 h-4" />
            <span>Bearer token will be added to Authorization header</span>
          </div>
          <div className="space-y-2">
            <Label>Token</Label>
            <div className="relative">
              <Input
                type={showToken ? "text" : "password"}
                value={authConfig.bearerToken || ""}
                onChange={(e) => updateAuth({ bearerToken: e.target.value })}
                placeholder="Enter bearer token"
                className="bg-background pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Format: Authorization: Bearer YOUR_TOKEN
            </p>
          </div>
        </div>
      )}

      {authConfig.type === "apikey" && (
        <div className="space-y-4 p-4 bg-secondary rounded-lg border border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Key className="w-4 h-4" />
            <span>API key authentication</span>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Key Name</Label>
              <Input
                value={authConfig.apiKeyName || ""}
                onChange={(e) => updateAuth({ apiKeyName: e.target.value })}
                placeholder="e.g., X-API-Key, api_key"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Value</Label>
              <div className="relative">
                <Input
                  type={showToken ? "text" : "password"}
                  value={authConfig.apiKey || ""}
                  onChange={(e) => updateAuth({ apiKey: e.target.value })}
                  placeholder="Enter API key"
                  className="bg-background pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Add to</Label>
              <Select
                value={authConfig.apiKeyLocation || "header"}
                onValueChange={(v) => updateAuth({ apiKeyLocation: v as "header" | "query" })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">Header</SelectItem>
                  <SelectItem value="query">Query Params</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {authConfig.type === "basic" && (
        <div className="space-y-4 p-4 bg-secondary rounded-lg border border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span>Basic authentication (Base64 encoded)</span>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                value={authConfig.basicUsername || ""}
                onChange={(e) => updateAuth({ basicUsername: e.target.value })}
                placeholder="Enter username"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={authConfig.basicPassword || ""}
                  onChange={(e) => updateAuth({ basicPassword: e.target.value })}
                  placeholder="Enter password"
                  className="bg-background pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Format: Authorization: Basic base64(username:password)
            </p>
          </div>
        </div>
      )}

      {authConfig.type === "oauth2" && (
        <div className="space-y-4 p-4 bg-secondary rounded-lg border border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>OAuth 2.0 authentication</span>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Access Token</Label>
              <div className="relative">
                <Input
                  type={showToken ? "text" : "password"}
                  value={authConfig.oauth2AccessToken || ""}
                  onChange={(e) => updateAuth({ oauth2AccessToken: e.target.value })}
                  placeholder="Enter access token"
                  className="bg-background pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Token Type</Label>
              <Input
                value={authConfig.oauth2TokenType || "Bearer"}
                onChange={(e) => updateAuth({ oauth2TokenType: e.target.value })}
                placeholder="Bearer"
                className="bg-background"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Token will be added to Authorization header
            </p>
          </div>
        </div>
      )}

      {authConfig.type === "none" && (
        <div className="p-8 text-center text-muted-foreground bg-secondary/50 rounded-lg border border-border">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No authentication required for this request</p>
        </div>
      )}
    </div>
  );
};
