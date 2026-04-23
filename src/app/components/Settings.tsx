import {
  User,
  Bell,
  Palette,
  Brain,
  Shield,
  Download,
  Trash2,
  Save,
  Camera,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { motion } from "motion/react";
import { useState } from "react";

interface SettingsProps {
  userName: string;
  userEmail?: string;
  onSave?: (settings: UserSettings) => void;
  onClose?: () => void;
}

interface UserSettings {
  name: string;
  email: string;
  notifications: {
    studyReminders: boolean;
    weeklyProgress: boolean;
    newFeatures: boolean;
  };
  appearance: {
    fontSize: "small" | "medium" | "large";
    reducedMotion: boolean;
  };
  study: {
    defaultQuizDifficulty: "easy" | "medium" | "hard";
    flashcardsPerSession: number;
    autoGenerateSummaries: boolean;
  };
  ai: {
    summaryLength: "short" | "medium" | "detailed";
    language: string;
  };
}

type NestedSettingsKey = keyof Pick<
  UserSettings,
  "notifications" | "appearance" | "study" | "ai"
>;

export function Settings({
  userName,
  userEmail = "",
  onSave,
  onClose,
}: SettingsProps) {
  const [settings, setSettings] = useState<UserSettings>({
    name: userName,
    email: userEmail,
    notifications: {
      studyReminders: true,
      weeklyProgress: true,
      newFeatures: false,
    },
    appearance: {
      fontSize: "medium",
      reducedMotion: false,
    },
    study: {
      defaultQuizDifficulty: "medium",
      flashcardsPerSession: 20,
      autoGenerateSummaries: true,
    },
    ai: {
      summaryLength: "medium",
      language: "English",
    },
  });

  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = <K extends NestedSettingsKey>(
    category: K,
    key: keyof UserSettings[K],
    value: UserSettings[K][keyof UserSettings[K]],
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave?.(settings);
    setHasChanges(false);
  };

  const settingsSections = [
    {
      id: "profile",
      title: "Profile",
      icon: User,
      description: "Manage your personal information",
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: Bell,
      description: "Control your notification preferences",
    },
    {
      id: "appearance",
      title: "Appearance",
      icon: Palette,
      description: "Customize how IntelliNote looks",
    },
    {
      id: "study",
      title: "Study Preferences",
      icon: Brain,
      description: "Configure your study settings",
    },
    {
      id: "data",
      title: "Data & Privacy",
      icon: Shield,
      description: "Manage your data and privacy",
    },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto p-4 lg:p-8 pb-20 lg:pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Settings Content */}
        <div className="space-y-6">
          {/* Profile Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3>Profile</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage your personal information
                    </p>
                  </div>
                </div>

                {/* Profile Photo */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-semibold">
                      {settings.name.charAt(0).toUpperCase()}
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h4 className="mb-1">Profile Photo</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload a profile picture
                    </p>
                    <Button variant="outline" size="sm">
                      Upload Photo
                    </Button>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Name & Email */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={settings.name}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          name: e.target.value,
                        });
                        setHasChanges(true);
                      }}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          email: e.target.value,
                        });
                        setHasChanges(true);
                      }}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3>Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      Control your notification preferences
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="mb-1">Study Reminders</h4>
                      <p className="text-sm text-muted-foreground">
                        Get reminded to study at your scheduled
                        times
                      </p>
                    </div>
                    <Switch
                      checked={
                        settings.notifications.studyReminders
                      }
                      onCheckedChange={(checked) =>
                        updateSetting(
                          "notifications",
                          "studyReminders",
                          checked,
                        )
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="mb-1">
                        Weekly Progress Reports
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Receive weekly summaries of your study
                        progress
                      </p>
                    </div>
                    <Switch
                      checked={
                        settings.notifications.weeklyProgress
                      }
                      onCheckedChange={(checked) =>
                        updateSetting(
                          "notifications",
                          "weeklyProgress",
                          checked,
                        )
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="mb-1">New Features</h4>
                      <p className="text-sm text-muted-foreground">
                        Be notified about new IntelliNote
                        features
                      </p>
                    </div>
                    <Switch
                      checked={
                        settings.notifications.newFeatures
                      }
                      onCheckedChange={(checked) =>
                        updateSetting(
                          "notifications",
                          "newFeatures",
                          checked,
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3>Appearance</h3>
                    <p className="text-sm text-muted-foreground">
                      Customize how IntelliNote looks
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="mb-3 block">
                      Font Size
                    </Label>
                    <div className="flex gap-3">
                      {(
                        ["small", "medium", "large"] as const
                      ).map((size) => (
                        <button
                          key={size}
                          onClick={() => {
                            updateSetting(
                              "appearance",
                              "fontSize",
                              size,
                            );
                          }}
                          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                            settings.appearance.fontSize ===
                            size
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <span className="capitalize">
                            {size}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="mb-1">Reduced Motion</h4>
                      <p className="text-sm text-muted-foreground">
                        Minimize animations and transitions
                      </p>
                    </div>
                    <Switch
                      checked={
                        settings.appearance.reducedMotion
                      }
                      onCheckedChange={(checked) =>
                        updateSetting(
                          "appearance",
                          "reducedMotion",
                          checked,
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Study Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3>Study Preferences</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure your study settings
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="mb-3 block">
                      Default Quiz Difficulty
                    </Label>
                    <div className="flex gap-3">
                      {(
                        ["easy", "medium", "hard"] as const
                      ).map((difficulty) => (
                        <button
                          key={difficulty}
                          onClick={() => {
                            updateSetting(
                              "study",
                              "defaultQuizDifficulty",
                              difficulty,
                            );
                          }}
                          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                            settings.study
                              .defaultQuizDifficulty ===
                            difficulty
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <span className="capitalize">
                            {difficulty}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="flashcards">
                      Flashcards Per Session
                    </Label>
                    <Input
                      id="flashcards"
                      type="number"
                      min="5"
                      max="50"
                      value={
                        settings.study.flashcardsPerSession
                      }
                      onChange={(e) => {
                        updateSetting(
                          "study",
                          "flashcardsPerSession",
                          parseInt(e.target.value),
                        );
                      }}
                    />
                    <p className="text-sm text-muted-foreground">
                      Number of flashcards to review in one
                      session (5-50)
                    </p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="mb-1">
                        Auto-Generate Summaries
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Automatically create summaries when
                        uploading documents
                      </p>
                    </div>
                    <Switch
                      checked={
                        settings.study.autoGenerateSummaries
                      }
                      onCheckedChange={(checked) =>
                        updateSetting(
                          "study",
                          "autoGenerateSummaries",
                          checked,
                        )
                      }
                    />
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-3 block">
                      AI Summary Length
                    </Label>
                    <div className="flex gap-3">
                      {(
                        ["short", "medium", "detailed"] as const
                      ).map((length) => (
                        <button
                          key={length}
                          onClick={() => {
                            updateSetting(
                              "ai",
                              "summaryLength",
                              length,
                            );
                          }}
                          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                            settings.ai.summaryLength === length
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <span className="capitalize">
                            {length}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Data & Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3>Data & Privacy</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage your data and privacy
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="mb-1">Export Your Data</h4>
                      <p className="text-sm text-muted-foreground">
                        Download all your documents, summaries,
                        and progress
                      </p>
                    </div>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                    <div className="flex-1">
                      <h4 className="mb-1 text-destructive">
                        Delete Account
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all
                        data
                      </p>
                    </div>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Save Button - Sticky at bottom */}
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-20 lg:bottom-8 left-0 right-0 lg:left-auto lg:right-8 px-4 lg:px-0"
          >
            <Card className="max-w-md mx-auto lg:ml-auto shadow-lg border-primary/20">
              <div className="p-4 flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  You have unsaved changes
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setHasChanges(false);
                      // Reset settings to original
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}