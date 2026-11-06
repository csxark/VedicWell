import React from "react";
import { AyurvedicArticle } from "@/types/knowledge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Clock, Tag, Award, CheckCircle2, Share2 } from "lucide-react";
import { LotusIcon } from "@/components/icons/SacredIcons";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ArticleReaderModalProps {
  article: AyurvedicArticle | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ArticleReaderModal: React.FC<ArticleReaderModalProps> = ({
  article,
  isOpen,
  onClose,
}) => {
  if (!article) return null;

  const handleShare = async () => {
    const url = `${window.location.origin}/knowledge?article=${article.id}`;
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Article link copied to clipboard!");
      } catch {
        toast.error("Failed to copy article link to clipboard.");
      }
    } else {
      toast.error("Clipboard API is not supported in this browser.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] p-0 overflow-hidden bg-background border-border">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-amber-900 text-white p-6 md:p-8 relative">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="outline" className="border-white/30 text-white bg-white/10 uppercase tracking-wider text-xs">
                {article.category}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-emerald-200">
                <Clock className="w-3.5 h-3.5" />
                {article.readTime}
              </div>
              {article.targetDosha && article.targetDosha !== "all" && (
                <Badge className="bg-amber-500/20 text-amber-200 border-amber-300/30 capitalize text-xs">
                  {article.targetDosha} Guide
                </Badge>
              )}
            </div>
            <DialogTitle className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2 leading-tight">
              {article.title}
            </DialogTitle>
            <DialogDescription className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
              {article.subtitle}
            </DialogDescription>
          </div>
          <LotusIcon className="w-20 h-20 text-white/20 absolute right-6 top-6 hidden md:block" />
        </div>

        {/* Scrollable Article Body */}
        <ScrollArea className="max-h-[calc(92vh-180px)] p-6 md:p-8">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Summary Box */}
            <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 text-foreground text-sm leading-relaxed font-serif italic">
              <strong>Executive Summary: </strong>
              {article.summary}
            </div>

            {/* Sections */}
            <div className="space-y-6">
              {article.sections.map((section, idx) => (
                <section key={idx} className="space-y-3">
                  <h3 className="font-display text-xl font-semibold text-foreground border-b border-border/60 pb-2">
                    {section.heading}
                  </h3>
                  <div className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                  {section.bulletPoints && section.bulletPoints.length > 0 && (
                    <ul className="space-y-2 pt-2">
                      {section.bulletPoints.map((point, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2.5 text-xs md:text-sm text-foreground/90">
                          <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>

            <Separator />

            {/* Classical References */}
            {article.classicalReferences && article.classicalReferences.length > 0 && (
              <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-secondary" />
                  Primary Classical References
                </h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground italic">
                  {article.classicalReferences.map((ref, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                      <span>{ref}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modern Context Note */}
            {article.modernContextNote && (
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200">
                <strong>Modern Scientific Context: </strong>
                {article.modernContextNote}
              </div>
            )}

            {/* Tags & Action Footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
              <div className="flex flex-wrap items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                {article.tags.map((t, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs font-normal">
                    {t}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5 text-xs">
                  <Share2 className="w-3.5 h-3.5" /> Share Article
                </Button>
                <Button size="sm" onClick={onClose} className="text-xs">
                  Done Reading
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

