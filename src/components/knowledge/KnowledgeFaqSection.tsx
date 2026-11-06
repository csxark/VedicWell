import React, { useState, useMemo } from "react";
import { HelpCircle, Search, Sparkles } from "lucide-react";
import { faqData } from "@/data/knowledge/agniCombinationsFaqData";
import { FAQItem } from "@/types/knowledge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const KnowledgeFaqSection: React.FC = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const filteredFaqs = useMemo(() => {
    return faqData.filter((item) => {
      if (category !== "all" && item.category !== category) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, category]);

  return (
    <div id="faq" className="scroll-mt-24 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <Badge variant="outline" className="border-secondary/40 text-secondary bg-secondary/10 uppercase tracking-wider text-xs">
          Phase 12 Common Questions
        </Badge>
        <h2 className="font-display text-2xl md:text-4xl text-foreground font-bold">
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Clear, evidence-aligned answers to common questions about Ayurvedic nutrition, 
          dietary restrictions, dual-dosha eating, and modern lifestyle integration.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search questions (e.g. vegetarian, raw foods, dual dosha, spices)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-xs rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {["all", "general", "diet", "doshas", "preparation", "lifestyle"].map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(cat)}
              className="text-xs capitalize h-7 px-3"
            >
              {cat === "all" ? "All Questions" : cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Accordion */}
      <div className="max-w-3xl mx-auto bg-card rounded-2xl border border-border/80 p-4 md:p-6 shadow-xs">
        <Accordion type="single" collapsible className="w-full space-y-2">
          {filteredFaqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="border border-border/60 rounded-xl px-4 py-1 data-[state=open]:bg-muted/30"
            >
              <AccordionTrigger className="text-left font-display text-sm md:text-base font-semibold hover:no-underline hover:text-secondary transition-colors py-3">
                <span className="flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <span>{faq.question}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-xs md:text-sm text-muted-foreground leading-relaxed pl-6 pr-2 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No questions found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

