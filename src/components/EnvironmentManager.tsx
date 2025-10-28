import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Eye, EyeOff, Settings, Globe } from "lucide-react";
import { toast } from "sonner";

export interface Environment {
  id: string;
  name: string;
  variables: Array<{ key: string; value: string; secret: boolean }>;
}

interface EnvironmentManagerProps {
  environments: Environment[];
  activeEnvironment: string | null;
  onEnvironmentsChange: (environments: Environment[]) => void;
  onActiveEnvironmentChange: (id: string | null) => void;
}

export const EnvironmentManager = ({
  environments,
  activeEnvironment,
  onEnvironmentsChange,
  onActiveEnvironmentChange,
}: EnvironmentManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingEnv, setEditingEnv] = useState<Environment | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const createNewEnvironment = () => {
    const newEnv: Environment = {
      id: crypto.randomUUID(),
      name: "New Environment",
      variables: [{ key: "", value: "", secret: false }],
    };
    setEditingEnv(newEnv);
  };

  const saveEnvironment = () => {
    if (!editingEnv) return;

    if (!editingEnv.name.trim()) {
      toast.error("Environment name is required");
      return;
    }

    const existingIndex = environments.findIndex((e) => e.id === editingEnv.id);
    let newEnvironments;

    if (existingIndex >= 0) {
      newEnvironments = [...environments];
      newEnvironments[existingIndex] = editingEnv;
    } else {
      newEnvironments = [...environments, editingEnv];
    }

    onEnvironmentsChange(newEnvironments);
    setEditingEnv(null);
    toast.success("Environment saved");
  };

  const deleteEnvironment = (id: string) => {
    onEnvironmentsChange(environments.filter((e) => e.id !== id));
    if (activeEnvironment === id) {
      onActiveEnvironmentChange(null);
    }
    toast.success("Environment deleted");
  };

  const addVariable = () => {
    if (!editingEnv) return;
    setEditingEnv({
      ...editingEnv,
      variables: [...editingEnv.variables, { key: "", value: "", secret: false }],
    });
  };

  const updateVariable = (index: number, updates: Partial<Environment["variables"][0]>) => {
    if (!editingEnv) return;
    const newVariables = [...editingEnv.variables];
    newVariables[index] = { ...newVariables[index], ...updates };
    setEditingEnv({ ...editingEnv, variables: newVariables });
  };

  const removeVariable = (index: number) => {
    if (!editingEnv) return;
    setEditingEnv({
      ...editingEnv,
      variables: editingEnv.variables.filter((_, i) => i !== index),
    });
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets({ ...showSecrets, [key]: !showSecrets[key] });
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={activeEnvironment || "none"} onValueChange={(v) => onActiveEnvironmentChange(v === "none" ? null : v)}>
        <SelectTrigger className="w-48 bg-secondary">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <SelectValue placeholder="No Environment" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No Environment</SelectItem>
          {environments.map((env) => (
            <SelectItem key={env.id} value={env.id}>
              {env.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Environments</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!editingEnv ? (
              <>
                <div className="space-y-2">
                  {environments.map((env) => (
                    <Card key={env.id} className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{env.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {env.variables.filter((v) => v.key).length} variables
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingEnv(env)}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteEnvironment(env.id)}
                          className="hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
                <Button onClick={createNewEnvironment} className="w-full bg-gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Environment
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Environment Name</Label>
                  <Input
                    value={editingEnv.name}
                    onChange={(e) => setEditingEnv({ ...editingEnv, name: e.target.value })}
                    placeholder="e.g., Production, Development, Staging"
                    className="bg-secondary"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Variables</Label>
                  <div className="space-y-2">
                    {editingEnv.variables.map((variable, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          placeholder="Key"
                          value={variable.key}
                          onChange={(e) => updateVariable(index, { key: e.target.value })}
                          className="bg-secondary"
                        />
                        <div className="relative flex-1">
                          <Input
                            type={variable.secret && !showSecrets[`${index}`] ? "password" : "text"}
                            placeholder="Value"
                            value={variable.value}
                            onChange={(e) => updateVariable(index, { value: e.target.value })}
                            className="bg-secondary pr-20"
                          />
                          <div className="absolute right-0 top-0 flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleSecretVisibility(`${index}`)}
                            >
                              {showSecrets[`${index}`] ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => updateVariable(index, { secret: !variable.secret })}
                              className={variable.secret ? "text-warning" : ""}
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeVariable(index)}
                          className="hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" onClick={addVariable} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Variable
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveEnvironment} className="flex-1 bg-gradient-primary">
                    Save Environment
                  </Button>
                  <Button variant="outline" onClick={() => setEditingEnv(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
