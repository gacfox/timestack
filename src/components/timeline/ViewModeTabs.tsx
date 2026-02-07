import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VIEW_MODES } from "@/constants";

interface ViewModeTabsProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ViewModeTabs({ value, onChange }: ViewModeTabsProps) {
  return (
    <Tabs value={value} onValueChange={onChange}>
      <TabsList>
        <TabsTrigger value={VIEW_MODES.DAY}>日</TabsTrigger>
        <TabsTrigger value={VIEW_MODES.WEEK}>周</TabsTrigger>
        <TabsTrigger value={VIEW_MODES.NEXT_4_DAYS}>未来4天</TabsTrigger>
        <TabsTrigger value={VIEW_MODES.AROUND_5_DAYS}>近5天</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
