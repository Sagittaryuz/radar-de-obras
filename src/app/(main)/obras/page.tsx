
'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { KanbanBoard } from '@/components/obras/kanban-board';
import { NewObraDialog } from '@/components/obras/new-obra-dialog';
import { getObras, getUsers, getLojas } from '@/lib/mock-data';
import type { Obra, User, Loja } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

async function imageToDataUrl(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}


export default function ObrasPage() {
  const [initialObras, setInitialObras] = useState<Obra[]>([]);
  const [sellers, setSellers] = useState<User[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPdfGenerating, startPdfGeneration] = useTransition();
  const { toast } = useToast();
  
  const searchParams = useSearchParams();
  const initialLoja = searchParams.get('lojaId') || 'all';
  const initialStatus = searchParams.get('status') as Obra['status'] | null;
  const initialStage = searchParams.get('stage') as Obra['stage'] | null;

  const [selectedLoja, setSelectedLoja] = useState(initialLoja);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [obrasData, sellersData, lojasData] = await Promise.all([
          getObras(),
          getUsers(),
          getLojas(),
        ]);
        setInitialObras(obrasData);
        setSellers(sellersData);
        setLojas(lojasData);
      } catch (error) {
        console.error("Failed to fetch obras page data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredObras = useMemo(() => {
    let obras = initialObras;
    if (selectedLoja !== 'all') {
      obras = obras.filter(obra => obra.lojaId === selectedLoja);
    }
    if (initialStatus) {
        obras = obras.filter(obra => obra.status === initialStatus);
    }
    if (initialStage) {
        obras = obras.filter(obra => obra.stage === initialStage);
    }
    if (dateRange?.from && dateRange?.to) {
        obras = obras.filter(obra => {
            if (!obra.createdAt) return false;
            const obraDate = new Date(obra.createdAt);
            // Adjust to the end of the selected day
            const toDate = new Date(dateRange.to!);
            toDate.setHours(23, 59, 59, 999);
            return obraDate >= dateRange.from! && obraDate <= toDate;
        });
    }
    return obras;
  }, [initialObras, selectedLoja, initialStatus, initialStage, dateRange]);
  
  // Set default tab on Kanban board if status is provided
  const defaultKanbanTab = initialStatus || undefined;

  const handleExportPdf = () => {
    startPdfGeneration(async () => {
        toast({ title: "Gerando PDF...", description: "Isso pode levar alguns segundos." });
        
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pageWidth - margin * 2;
        let yPos = margin;

        for (const [index, obra] of filteredObras.entries()) {
            if (index > 0) {
                doc.addPage();
                yPos = margin;
            }
            
            doc.setFontSize(16).setFont('helvetica', 'bold');
            const title = (obra.contacts && obra.contacts.length > 0 && obra.contacts[0].name) ? obra.contacts[0].name : obra.clientName;
            doc.text(title, pageWidth / 2, yPos, { align: 'center' });
            yPos += 10;
            
            doc.setFontSize(12).setFont('helvetica', 'normal');
            
            const addField = (label: string, value: string | undefined | null) => {
              if (value) {
                doc.setFont('helvetica', 'bold');
                doc.text(`${label}: `, margin, yPos);
                const labelWidth = doc.getTextWidth(`${label}: `);
                doc.setFont('helvetica', 'normal');
                const textLines = doc.splitTextToSize(value, contentWidth - labelWidth);
                doc.text(textLines, margin + labelWidth, yPos);
                yPos += textLines.length * 5;
              }
            };

            addField('Endereço', obra.address);
            addField('Etapa', obra.stage);
            addField('Status', obra.status);
            addField('Detalhes', obra.details);
            yPos += 5;

            if (obra.contacts && obra.contacts.length > 0) {
                doc.setFontSize(14).setFont('helvetica', 'bold');
                doc.text('Contatos', margin, yPos);
                yPos += 7;
                doc.setFontSize(10).setFont('helvetica', 'normal');
                obra.contacts.forEach(contact => {
                   addField('Nome', contact.name);
                   addField('Função', contact.type);
                   addField('Telefone', contact.phone);
                   yPos += 2;
                });
            }
            
            yPos += 5;

            if (obra.photoUrls && obra.photoUrls.length > 0) {
                doc.setFontSize(14).setFont('helvetica', 'bold');
                doc.text('Fotos', margin, yPos);
                yPos += 7;
                
                for (const url of obra.photoUrls) {
                  try {
                    const dataUrl = await imageToDataUrl(url);
                    const img = new Image();
                    img.src = dataUrl;
                    await new Promise(resolve => img.onload = resolve);

                    const imgWidth = img.width;
                    const imgHeight = img.height;
                    const ratio = imgWidth / imgHeight;

                    let finalWidth = contentWidth / 2;
                    let finalHeight = finalWidth / ratio;
                    
                    if (yPos + finalHeight > pageHeight - margin) {
                        doc.addPage();
                        yPos = margin;
                    }

                    doc.addImage(dataUrl, 'JPEG', margin, yPos, finalWidth, finalHeight);
                    yPos += finalHeight + 5;

                  } catch (e) {
                      console.error("Failed to process image for PDF", e);
                      doc.setFontSize(8).setTextColor(255,0,0);
                      doc.text('Erro ao carregar imagem', margin, yPos);
                      doc.setTextColor(0);
                      yPos += 5;
                  }
                }
            }
        }
        
        doc.save(`relatorio_obras_${new Date().toISOString().slice(0,10)}.pdf`);
        toast({ title: "PDF Gerado!", description: "Seu download deve começar em breve." });
    });
  }


  if (loading) {
     return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32 ml-auto" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
            <h1 className="font-headline text-3xl font-bold tracking-tight">Quadro de Obras</h1>
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <div className="w-full sm:w-52">
                 <Select value={selectedLoja} onValueChange={setSelectedLoja}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filtrar por unidade..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas as Unidades</SelectItem>
                        {lojas.map(loja => (
                            <SelectItem key={loja.id} value={loja.id}>{loja.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Selecione um período</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" onClick={handleExportPdf} disabled={isPdfGenerating || filteredObras.length === 0} className="w-full md:w-auto">
                {isPdfGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <FileDown className="mr-2 h-4 w-4" />
                )}
                Exportar PDF
            </Button>
            <div className="w-full md:w-auto">
              <NewObraDialog />
            </div>
        </div>
      </div>
      <KanbanBoard obras={filteredObras} sellers={sellers} defaultTab={defaultKanbanTab} />
    </div>
  );
}
