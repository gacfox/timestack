import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { Eye, EyeOff, Github } from "lucide-react";
import logo from "@/assets/icon@512.png";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { settings, loadSettings, updateLLMConfig, updateReportTemplate } =
    useSettingsStore();

  const [apiKey, setApiKey] = useState(settings.llm.apiKey || "");
  const [baseUrl, setBaseUrl] = useState(settings.llm.baseUrl || "");
  const [modelName, setModelName] = useState(settings.llm.modelName || "");
  const [showApiKey, setShowApiKey] = useState(false);

  const [dailyPrompt, setDailyPrompt] = useState(
    settings.reportTemplates.daily,
  );
  const [weeklyPrompt, setWeeklyPrompt] = useState(
    settings.reportTemplates.weekly,
  );
  const [monthlyPrompt, setMonthlyPrompt] = useState(
    settings.reportTemplates.monthly,
  );
  const [yearlyPrompt, setYearlyPrompt] = useState(
    settings.reportTemplates.yearly,
  );

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open, loadSettings]);

  useEffect(() => {
    if (!open) return;
    setApiKey(settings.llm.apiKey || "");
    setBaseUrl(settings.llm.baseUrl || "");
    setModelName(settings.llm.modelName || "");
    setDailyPrompt(settings.reportTemplates.daily);
    setWeeklyPrompt(settings.reportTemplates.weekly);
    setMonthlyPrompt(settings.reportTemplates.monthly);
    setYearlyPrompt(settings.reportTemplates.yearly);
    setShowApiKey(false);
  }, [open, settings]);

  const handleSaveLLM = async () => {
    await updateLLMConfig(apiKey, baseUrl || undefined, modelName);
    onClose();
  };

  const handleSaveTemplates = async () => {
    await updateReportTemplate("daily", dailyPrompt);
    await updateReportTemplate("weekly", weeklyPrompt);
    await updateReportTemplate("monthly", monthlyPrompt);
    await updateReportTemplate("yearly", yearlyPrompt);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>系统设置</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="llm" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="llm">LLM 配置</TabsTrigger>
            <TabsTrigger value="templates">报告模板</TabsTrigger>
            <TabsTrigger value="about">关于</TabsTrigger>
          </TabsList>

          <TabsContent value="llm" className="space-y-4">
            <DialogDescription className="mb-4">
              配置大语言模型用于生成工作报告
            </DialogDescription>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  API Key{" "}
                  <span className="text-xs text-muted-foreground">
                    （可选）
                  </span>
                </label>
                <div className="relative">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="输入 API Key"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowApiKey((v) => !v)}
                    aria-label={showApiKey ? "隐藏 API Key" : "显示 API Key"}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Base URL{" "}
                  <span className="text-xs text-muted-foreground">
                    （可选）
                  </span>
                </label>
                <Input
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="例如：https://api.openai.com/v1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  留空使用默认的 OpenAI API 地址
                </p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  模型名称
                </label>
                <Input
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="例如：gpt-4o-mini"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button onClick={handleSaveLLM}>保存</Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <DialogDescription className="mb-4">
              自定义不同类型报告的生成提示词
            </DialogDescription>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  日报模板
                </label>
                <textarea
                  className="w-full p-2 border rounded-md min-h-20 overflow-auto scrollbar-hide"
                  value={dailyPrompt}
                  onChange={(e) => setDailyPrompt(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  周报模板
                </label>
                <textarea
                  className="w-full p-2 border rounded-md min-h-20 overflow-auto scrollbar-hide"
                  value={weeklyPrompt}
                  onChange={(e) => setWeeklyPrompt(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  季度报模板
                </label>
                <textarea
                  className="w-full p-2 border rounded-md min-h-20 overflow-auto scrollbar-hide"
                  value={monthlyPrompt}
                  onChange={(e) => setMonthlyPrompt(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  年报模板
                </label>
                <textarea
                  className="w-full p-2 border rounded-md min-h-20 overflow-auto scrollbar-hide"
                  value={yearlyPrompt}
                  onChange={(e) => setYearlyPrompt(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button onClick={handleSaveTemplates}>保存</Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <img src={logo} alt="Timestack" className="h-6 w-6 rounded" />
                <h3 className="text-2xl font-bold">Timestack</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                AI 增强型桌面日程管理应用
              </p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-sm text-muted-foreground">版本 0.1.0</p>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="打开 GitHub"
                  onClick={() =>
                    window.electron?.openExternal(
                      "https://github.com/gacfox/timestack",
                    )
                  }
                >
                  <Github className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>核心功能：</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>事件、任务、预约管理</li>
                <li>时间轴可视化</li>
                <li>AI 自动工作报告生成</li>
                <li>预约提醒</li>
                <li>深色模式</li>
              </ul>
            </div>
            <DialogFooter>
              <Button onClick={onClose}>关闭</Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
