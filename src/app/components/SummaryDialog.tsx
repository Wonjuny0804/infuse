import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: string;
}

const SummaryDialog: React.FC<SummaryDialogProps> = ({
  open,
  onOpenChange,
  summary,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Summary</DialogTitle>
        </DialogHeader>
        <DialogDescription>{summary}</DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default SummaryDialog;
