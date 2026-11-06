import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Clock, Tag, ArrowRight, Sparkles, Filter } from "lucide-react";
import { articlesData } from "@/data/knowledge/articlesData";
import { AyurvedicArticle } from "@/types/knowledge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArticleReaderModal } from "./ArticleReaderModal";

interface ArticlesLibrarySectionProps {
  initialArticleId?: string;
}

export const ArticlesLibrarySection: React.FC<ArticlesLibrarySectionProps> = ({
  initialArticleId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [readingArticle, setReadingArticle] = useState<AyurvedicArticle | null>(() => {
    if (initialArticleId) {
      return articlesData.find((a) => a.id === initialArticleId) || null;
    }
    return null;
  });

  useEffect(() => {
    if (initialArticleId) {
      const found = articlesData.find((a) => a.id === initialArticleId);
      if (found) {
        setReadingArticle(found);
      }
    }
  }, [initialArticleId]);

  const filteredArticles = useMemo(() => {
    if (selectedCategory === "all") return articlesData;
    return articlesData.filter((art) => art.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div id="articles" className="scroll-mt-24 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="border-secondary/40 text-secondary bg-secondary/10 uppercase tracking-wider text-xs mb-2">
            Educational Literature
          </Badge>
          <h2 className="font-display text-2xl md:text-4xl text-foreground font-bold">
            Ayurvedic Wisdom & Educational Articles
          </h2>
          <p className="text-muted-foreground text-sm max-w-2xl mt-1">
            Authoritative, Samhita-referenced educational papers exploring classical fundamentals, 
            digestive energetics, circadian daily routines (Dinacharya), and longevity.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/80 self-start md:self-auto">
          {["all", "fundamentals", "nutrition", "digestion", "lifestyle"].map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="text-xs capitalize h-8 px-3"
            >
              {cat === "all" ? "All Articles" : cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            layout
          >
            <Card className="h-full flex flex-col justify-between hover:border-secondary/50 hover:shadow-md transition-all group bg-card overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                    {article.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="w-3 h-3 text-secondary" />
                    <span>{article.readTime}</span>
                  </div>
                </div>
                <CardTitle className="font-display text-xl text-foreground group-hover:text-secondary transition-colors line-clamp-2">
                  {article.title}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {article.subtitle}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {article.summary}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {article.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-muted/60 text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReadingArticle(article)}
                  className="w-full text-xs gap-1.5 border-secondary/30 hover:bg-secondary hover:text-white transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Read Full Article
                  <ArrowRight className="w-3 h-3 ml-auto opacity-70 group-hover:opacity-100 transition-opacity" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Reader Modal */}
      <ArticleReaderModal
        article={readingArticle}
        isOpen={Boolean(readingArticle)}
        onClose={() => setReadingArticle(null)}
      />
    </div>
  );
};

