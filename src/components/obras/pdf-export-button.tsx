
'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import type { Obra } from '@/lib/firestore-data';
import { imageToDataUrl } from '@/lib/actions';

interface PdfExportButtonProps {
    obras: Obra[];
}

export function PdfExportButton({ obras }: PdfExportButtonProps) {
    const [isPdfGenerating, startPdfGeneration] = useTransition();
    const { toast } = useToast();

    const handleExportPdf = () => {
        startPdfGeneration(async () => {
            if (obras.length === 0) {
                toast({ title: "Nenhuma obra para exportar", description: "O filtro atual não retornou obras.", variant: "destructive" });
                return;
            }

            toast({ title: "Gerando PDF...", description: "Isso pode levar alguns segundos." });
            
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 15;
            const contentWidth = pageWidth - margin * 2;
            let yPos = margin;

            for (const [index, obra] of obras.entries()) {
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
                        const dataUrlResult = await imageToDataUrl(url);
                        if (!dataUrlResult.success || !dataUrlResult.dataUrl) {
                            throw new Error(dataUrlResult.error || 'Failed to get data URL');
                        }
                        
                        const img = new Image();
                        img.src = dataUrlResult.dataUrl;
                        await new Promise(resolve => img.onload = resolve);

                        const imgWidth = img.width;
                        const imgHeight = img.height;
                        const ratio = imgWidth / imgHeight;
                        const pageHeight = doc.internal.pageSize.getHeight();

                        let finalWidth = contentWidth / 2;
                        let finalHeight = finalWidth / ratio;
                        
                        if (yPos + finalHeight > pageHeight - margin) {
                            doc.addPage();
                            yPos = margin;
                        }

                        doc.addImage(dataUrlResult.dataUrl, 'JPEG', margin, yPos, finalWidth, finalHeight);
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

    return (
        <Button variant="outline" onClick={handleExportPdf} disabled={isPdfGenerating || obras.length === 0} className="w-full md:w-auto">
            {isPdfGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <FileDown className="mr-2 h-4 w-4" />
            )}
            Exportar PDF
        </Button>
    );
}
