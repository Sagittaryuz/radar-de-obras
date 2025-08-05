
'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2 } from 'lucide-react';
import { analyzeSite } from '@/ai/flows/site-analyzer-flow';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

// Simple markdown to HTML renderer
const MarkdownRenderer = ({ content }: { content: string }) => {
    // Replace markdown headers, lists, and bold text with HTML tags
    const htmlContent = content
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\n- /gim, '<br />&bull; ')
      .replace(/\n/gim, '<br />');
  
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} className="prose prose-sm dark:prose-invert" />;
};


export function AiAssistant() {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleAnalysis = () => {
    startTransition(async () => {
      setAnalysis(null);
      try {
        const result = await analyzeSite();
        setAnalysis(result.analysis);
        toast({
            title: "Análise Concluída",
            description: "O assistente de IA finalizou a análise do seu site.",
        });
      } catch (error) {
        console.error("AI Analysis Error:", error);
        toast({
          variant: 'destructive',
          title: "Erro na Análise",
          description: "Ocorreu um erro ao analisar o site. Verifique o console para mais detalhes.",
        });
      }
    });
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="font-headline">Assistente de IA</CardTitle>
        <CardDescription>
          Clique no botão abaixo para que a IA analise todo o código do seu projeto em busca de erros,
          melhorias de desempenho e problemas de lógica.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleAnalysis} disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Analisar meu Site
        </Button>

        {isPending && (
            <div className="space-y-2 pt-4">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="text-center text-sm text-muted-foreground">
                    Analisando o código... Isso pode levar um minuto.
                </p>
            </div>
        )}

        {analysis && (
          <ScrollArea className="h-96 rounded-md border bg-muted/30 p-4">
             <MarkdownRenderer content={analysis} />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
