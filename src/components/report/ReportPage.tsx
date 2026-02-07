import { useRef, useState, useEffect } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  endOfQuarter,
  setWeek,
  setYear,
} from "date-fns";
import ReactMarkdown from "react-markdown";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import {
  Copy,
  Download,
  Loader2,
  RefreshCcw,
  Save,
  Trash2,
  X,
  Pencil,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEventStore } from "@/stores/useEventStore";
import { useTaskStore } from "@/stores/useTaskStore";
import { useSettingsStore } from "@/stores/useSettingsStore";

interface ReportPageProps {
  open: boolean;
  onClose: () => void;
}

export default function ReportPage({ open, onClose }: ReportPageProps) {
  const events = useEventStore((state) => state.events);
  const tasks = useTaskStore((state) => state.tasks);
  const { settings, loadSettings } = useSettingsStore();

  const [reportType, setReportType] = useState<
    "daily" | "weekly" | "quarterly" | "yearly"
  >("daily");
  const today = new Date();
  const [dailyDate, setDailyDate] = useState(format(today, "yyyy-MM-dd"));
  const [weekValue, setWeekValue] = useState(format(today, "RRRR-'W'II"));
  const [quarterYear, setQuarterYear] = useState(today.getFullYear());
  const [quarter, setQuarter] = useState(Math.floor(today.getMonth() / 3) + 1);
  const [yearValue, setYearValue] = useState(today.getFullYear());
  const [startDate, setStartDate] = useState(format(today, "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(today, "yyyy-MM-dd"));
  const [generatedReport, setGeneratedReport] = useState("");
  const reportContentRef = useRef("");
  const [isEditing, setIsEditing] = useState(false);
  const [draftReport, setDraftReport] = useState("");
  const skipSavedResetRef = useRef(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasStreamStarted, setHasStreamStarted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [savedReportId, setSavedReportId] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyReports, setHistoryReports] = useState<any[]>([]);
  const [historyDeleteId, setHistoryDeleteId] = useState<string | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open, loadSettings]);

  useEffect(() => {
    return () => {
      if (window.electron?.llm?.removeReportListeners) {
        window.electron.llm.removeReportListeners();
      }
    };
  }, []);

  useEffect(() => {
    const updateTheme = () => {
      setIsDarkTheme(document.documentElement.classList.contains("dark"));
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const parseWeekValue = (value: string) => {
    const [yearPart, weekPart] = value.split("-W");
    const year = Number(yearPart);
    const week = Number(weekPart);
    if (!year || !week) return new Date();
    const base = setYear(new Date(), year);
    const withWeek = setWeek(base, week, { weekStartsOn: 1 });
    return startOfWeek(withWeek, { weekStartsOn: 1 });
  };

  const getPeriodDates = (
    type: "daily" | "weekly" | "quarterly" | "yearly",
  ) => {
    switch (type) {
      case "daily": {
        const date = new Date(dailyDate);
        return { start: date, end: date };
      }
      case "weekly": {
        const weekStart = parseWeekValue(weekValue);
        return {
          start: weekStart,
          end: endOfWeek(weekStart, { weekStartsOn: 1 }),
        };
      }
      case "quarterly": {
        const start = new Date(quarterYear, (quarter - 1) * 3, 1);
        return { start, end: endOfQuarter(start) };
      }
      case "yearly": {
        return {
          start: new Date(yearValue, 0, 1),
          end: new Date(yearValue, 11, 31),
        };
      }
    }
  };

  useEffect(() => {
    const { start, end } = getPeriodDates(reportType);
    setStartDate(format(start, "yyyy-MM-dd"));
    setEndDate(format(end, "yyyy-MM-dd"));
  }, [reportType, dailyDate, weekValue, quarterYear, quarter, yearValue]);

  useEffect(() => {
    if (skipSavedResetRef.current) {
      skipSavedResetRef.current = false;
      return;
    }
    setSavedReportId(null);
    setSavedMessage("");
  }, [reportType, dailyDate, weekValue, quarterYear, quarter, yearValue]);

  const handleSelectPeriod = (
    type: "daily" | "weekly" | "quarterly" | "yearly",
  ) => {
    const now = new Date();
    setReportType(type);
    if (type === "daily") {
      setDailyDate(format(now, "yyyy-MM-dd"));
    } else if (type === "weekly") {
      setWeekValue(format(now, "RRRR-'W'II"));
    } else if (type === "quarterly") {
      setQuarterYear(now.getFullYear());
      setQuarter(Math.floor(now.getMonth() / 3) + 1);
    } else if (type === "yearly") {
      setYearValue(now.getFullYear());
    }
    setGeneratedReport("");
  };

  const loadHistory = async () => {
    if (!window.electron?.db?.getReports) return;
    try {
      const reports = await window.electron.db.getReports();
      setHistoryReports(reports || []);
    } catch (error) {
      console.error("Failed to load reports:", error);
    }
  };

  const formatDateInputValue = (date: Date) => format(date, "yyyy-MM-dd");

  const loadReportIntoView = (report: any) => {
    skipSavedResetRef.current = true;
    setGeneratedReport(report.content || "");
    reportContentRef.current = report.content || "";
    setIsEditing(false);
    setDraftReport("");
    setSavedReportId(report.id || null);
    setSavedMessage("已保存");

    const start = new Date(report.startDate);
    if (report.type === "daily") {
      setReportType("daily");
      setDailyDate(formatDateInputValue(start));
    } else if (report.type === "weekly") {
      setReportType("weekly");
      setWeekValue(format(start, "RRRR-'W'II"));
    } else if (report.type === "quarterly") {
      setReportType("quarterly");
      setQuarterYear(start.getFullYear());
      setQuarter(Math.floor(start.getMonth() / 3) + 1);
    } else if (report.type === "yearly") {
      setReportType("yearly");
      setYearValue(start.getFullYear());
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    setHasStreamStarted(false);
    setGeneratedReport("");
    reportContentRef.current = "";
    setIsEditing(false);
    setDraftReport("");
    setErrorMessage("");
    setSavedReportId(null);
    setSavedMessage("");
    try {
      const start = parseLocalDate(startDate);
      const end = parseLocalDate(endDate);
      end.setHours(23, 59, 59, 999);

      const periodEvents = events.filter((e) => {
        const eventDate = new Date(e.startTime);
        return eventDate >= start && eventDate <= end;
      });

      const periodTasks = tasks.filter((t) => {
        const taskStart = new Date(t.startTime);
        const taskEnd = new Date(t.dueDate);
        return taskStart <= end && taskEnd >= start;
      });

      const summary = generateSummary(periodEvents, periodTasks);
      const template =
        reportType === "daily"
          ? settings.reportTemplates.daily
          : reportType === "weekly"
            ? settings.reportTemplates.weekly
            : reportType === "quarterly"
              ? settings.reportTemplates.monthly
              : settings.reportTemplates.yearly;

      const systemPrompt = (template || "").trim();
      const userPrompt = summary;
      if (!window.electron?.llm) {
        setErrorMessage("LLM 服务不可用");
        setIsGenerating(false);
        return;
      }

      const requestId = crypto.randomUUID();
      let started = false;

      window.electron.llm.removeReportListeners();
      window.electron.llm.onReportChunk(({ requestId: id, content }) => {
        if (id !== requestId) return;
        if (!started && content) {
          started = true;
          setHasStreamStarted(true);
        }
        if (content) {
          setGeneratedReport((prev) => {
            const next = prev + content;
            reportContentRef.current = next;
            return next;
          });
        }
      });
      window.electron.llm.onReportDone(({ requestId: id }) => {
        if (id !== requestId) return;
        setIsGenerating(false);
        const finalContent = reportContentRef.current.trim();
        if (finalContent && window.electron?.db) {
          const reportStart = parseLocalDate(startDate);
          const reportEnd = parseLocalDate(endDate);
          reportEnd.setHours(23, 59, 59, 999);
          const payload = {
            type: reportType,
            content: finalContent,
            startDate: reportStart.getTime(),
            endDate: reportEnd.getTime(),
          };
          const savePromise = savedReportId
            ? window.electron.db
                .updateReport(savedReportId, payload)
                .then(() => savedReportId)
            : window.electron.db.addReport(payload);

          savePromise
            .then((id) => {
              setSavedReportId(id);
              setSavedMessage(savedReportId ? "已更新" : "已保存");
            })
            .catch(() => {
              setSavedMessage(savedReportId ? "更新失败" : "保存失败");
            });
        }
      });
      window.electron.llm.onReportError(({ requestId: id, error }) => {
        if (id !== requestId) return;
        setErrorMessage(error || "生成报告失败");
        setIsGenerating(false);
      });

      await window.electron.llm.generateReport(
        requestId,
        systemPrompt,
        userPrompt,
      );
    } catch (error) {
      console.error("Failed to generate report:", error);
      setErrorMessage("生成报告失败，请重试");
      setIsGenerating(false);
    } finally {
      // handled by IPC callbacks
    }
  };

  const parseLocalDate = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  };

  const generateSummary = (eventList: any[], taskList: any[]) => {
    let summary = "以下为用户日程汇总\n";
    const formatDescription = (description?: string) => {
      const text = (description || "").trim();
      if (!text) return "";
      const normalized = text.replace(/\r\n/g, "\n");
      const indented = normalized
        .split("\n")
        .map((line) => `  ${line}`)
        .join("\n");
      return `\n  描述:\n${indented}`;
    };

    if (eventList.length > 0) {
      summary += "\n事件:\n";
      eventList.forEach((e) => {
        summary += `- ${e.title} (${format(new Date(e.startTime), "MM-dd HH:mm")} - ${format(new Date(e.endTime), "HH:mm")})`;
        summary += formatDescription(e.description);
        summary += "\n";
      });
    }

    if (taskList.length > 0) {
      summary += "\n任务:\n";
      taskList.forEach((t) => {
        const statusText = t.isCompleted ? "已完成" : "进行中";
        summary += `- ${t.title} (截止: ${format(new Date(t.dueDate), "MM-dd HH:mm")}) [${statusText}]`;
        summary += formatDescription(t.description);
        summary += "\n";
      });
    }

    return summary;
  };

  if (!open) return null;

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">撰写报告</h2>
        <Button variant="outline" onClick={onClose}>
          返回
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 p-4 border-b">
          <Card className="p-4">
            <h3 className="font-medium mb-3">选择时间范围</h3>
            <div className="space-y-2">
              <Button
                variant={reportType === "daily" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => handleSelectPeriod("daily")}
              >
                日报
              </Button>
              <Button
                variant={reportType === "weekly" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => handleSelectPeriod("weekly")}
              >
                周报
              </Button>
              <Button
                variant={reportType === "quarterly" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => handleSelectPeriod("quarterly")}
              >
                季度报
              </Button>
              <Button
                variant={reportType === "yearly" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => handleSelectPeriod("yearly")}
              >
                年报
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h3 className="font-medium mb-3">自定义日期</h3>
              <div className="space-y-2">
                {reportType === "daily" && (
                  <div>
                    <label className="text-xs text-muted-foreground">
                      日期
                    </label>
                    <input
                      type="date"
                      value={dailyDate}
                      onChange={(e) => setDailyDate(e.target.value)}
                      className="w-full p-2 border rounded-md text-sm"
                    />
                  </div>
                )}
                {reportType === "weekly" && (
                  <div>
                    <label className="text-xs text-muted-foreground">周</label>
                    <input
                      type="week"
                      value={weekValue}
                      onChange={(e) => setWeekValue(e.target.value)}
                      className="w-full p-2 border rounded-md text-sm"
                    />
                  </div>
                )}
                {reportType === "quarterly" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground">
                        年份
                      </label>
                      <input
                        type="number"
                        value={quarterYear}
                        onChange={(e) => setQuarterYear(Number(e.target.value))}
                        className="w-full p-2 border rounded-md text-sm"
                        min={2000}
                        max={2100}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        季度
                      </label>
                      <select
                        value={quarter}
                        onChange={(e) => setQuarter(Number(e.target.value))}
                        className="w-full p-2 border rounded-md text-sm"
                      >
                        <option value={1}>Q1</option>
                        <option value={2}>Q2</option>
                        <option value={3}>Q3</option>
                        <option value={4}>Q4</option>
                      </select>
                    </div>
                  </div>
                )}
                {reportType === "yearly" && (
                  <div>
                    <label className="text-xs text-muted-foreground">
                      年份
                    </label>
                    <input
                      type="number"
                      value={yearValue}
                      onChange={(e) => setYearValue(Number(e.target.value))}
                      className="w-full p-2 border rounded-md text-sm"
                      min={2000}
                      max={2100}
                    />
                  </div>
                )}
              </div>
            </div>

            <Button
              className="w-full mt-4"
              onClick={generateReport}
              disabled={isGenerating}
            >
              {isGenerating ? "生成中..." : "生成报告"}
            </Button>
            <Button
              className="w-full mt-2"
              variant="outline"
              onClick={async () => {
                await loadHistory();
                setHistoryOpen(true);
              }}
            >
              历史报告
            </Button>
          </Card>
        </div>

        <div className="flex-1 p-4 overflow-auto">
          <Card className="p-6 h-full overflow-auto scrollbar-hide relative">
            {!generatedReport && !isGenerating && !errorMessage ? (
              <div className="text-center text-muted-foreground py-12">
                选择时间范围并点击生成按钮
              </div>
            ) : null}
            {isGenerating && !hasStreamStarted ? (
              <div className="flex flex-col items-center justify-center text-muted-foreground py-12 gap-3">
                <Loader2 className="h-6 w-6 animate-spin" />
                生成中...
              </div>
            ) : null}
            {errorMessage ? (
              <div className="text-center text-destructive py-12">
                {errorMessage}
              </div>
            ) : (
              generatedReport &&
              (isEditing ? (
                <div className="h-full pt-12">
                  <CodeMirror
                    value={draftReport}
                    height="480px"
                    basicSetup={{
                      lineNumbers: true,
                      foldGutter: false,
                      highlightActiveLine: true,
                    }}
                    extensions={[markdown({ codeLanguages: languages })]}
                    theme={isDarkTheme ? githubDark : githubLight}
                    onChange={(value) => setDraftReport(value)}
                  />
                </div>
              ) : (
                <div className="report-markdown max-w-none">
                  <ReactMarkdown>{generatedReport}</ReactMarkdown>
                </div>
              ))
            )}

            {!isGenerating && generatedReport && (
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {savedMessage ? (
                  <span className="text-xs text-muted-foreground">
                    {savedMessage}
                  </span>
                ) : null}
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={async () => {
                        const content = (draftReport || "").trim();
                        if (!content || !window.electron?.db) {
                          setIsEditing(false);
                          return;
                        }
                        const reportStart = parseLocalDate(startDate);
                        const reportEnd = parseLocalDate(endDate);
                        reportEnd.setHours(23, 59, 59, 999);
                        const payload = {
                          type: reportType,
                          content,
                          startDate: reportStart.getTime(),
                          endDate: reportEnd.getTime(),
                        };
                        try {
                          const id = savedReportId
                            ? await window.electron.db
                                .updateReport(savedReportId, payload)
                                .then(() => savedReportId)
                            : await window.electron.db.addReport(payload);
                          setSavedReportId(id);
                          setSavedMessage(savedReportId ? "已更新" : "已保存");
                          setGeneratedReport(content);
                          reportContentRef.current = content;
                        } catch (error) {
                          console.error("Failed to save report:", error);
                          setSavedMessage(
                            savedReportId ? "更新失败" : "保存失败",
                          );
                        } finally {
                          setIsEditing(false);
                          setDraftReport("");
                        }
                      }}
                      aria-label="保存"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setIsEditing(false);
                        setDraftReport("");
                      }}
                      aria-label="放弃编辑"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={generateReport}
                      aria-label="重新生成"
                    >
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setDraftReport(generatedReport);
                        setIsEditing(true);
                      }}
                      aria-label="编辑"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(generatedReport);
                        } catch (err) {
                          console.error("Copy failed:", err);
                        }
                      }}
                      aria-label="复制"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const blob = new Blob([generatedReport], {
                          type: "text/markdown;charset=utf-8",
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `report-${reportType}-${startDate}-to-${endDate}.md`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      aria-label="下载"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {savedReportId ? (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setConfirmDeleteOpen(true)}
                        aria-label="删除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setGeneratedReport("");
                        reportContentRef.current = "";
                        setIsEditing(false);
                        setDraftReport("");
                        setSavedReportId(null);
                        setSavedMessage("");
                      }}
                      aria-label="关闭"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Dialog
        open={confirmDeleteOpen}
        onOpenChange={(open) => setConfirmDeleteOpen(open)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            删除后将清空当前报告内容，此操作无法撤销。
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!savedReportId || !window.electron?.db?.deleteReport) {
                  setConfirmDeleteOpen(false);
                  return;
                }
                try {
                  await window.electron.db.deleteReport(savedReportId);
                } catch (error) {
                  console.error("Failed to delete report:", error);
                }
                setConfirmDeleteOpen(false);
                setGeneratedReport("");
                reportContentRef.current = "";
                setSavedReportId(null);
                setSavedMessage("");
              }}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>历史报告</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {historyReports.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">
                暂无历史报告
              </div>
            ) : (
              <div className="space-y-3">
                {historyReports.map((report) => (
                  <Card key={report.id} className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-medium">
                          {report.type === "daily"
                            ? "日报"
                            : report.type === "weekly"
                              ? "周报"
                              : report.type === "quarterly"
                                ? "季度报"
                                : "年报"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          生成时间:{" "}
                          {format(
                            new Date(report.createdAt),
                            "yyyy-MM-dd HH:mm",
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            loadReportIntoView(report);
                            setHistoryOpen(false);
                          }}
                        >
                          打开
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setHistoryDeleteId(report.id)}
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!historyDeleteId}
        onOpenChange={(open) => {
          if (!open) setHistoryDeleteId(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            删除后将移除该报告记录，此操作无法撤销。
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryDeleteId(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!historyDeleteId || !window.electron?.db?.deleteReport) {
                  setHistoryDeleteId(null);
                  return;
                }
                try {
                  await window.electron.db.deleteReport(historyDeleteId);
                } catch (error) {
                  console.error("Failed to delete report:", error);
                }

                setHistoryReports((prev) =>
                  prev.filter((item) => item.id !== historyDeleteId),
                );
                if (savedReportId === historyDeleteId) {
                  setGeneratedReport("");
                  reportContentRef.current = "";
                  setSavedReportId(null);
                  setSavedMessage("");
                }
                setHistoryDeleteId(null);
              }}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
