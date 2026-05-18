import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportToPDF(elementId: string, filename: string, options?: { hideImages?: boolean }) {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.position = 'static';
          clonedElement.style.left = '0';
          clonedElement.style.display = 'block';
        }

        // Remove ALL existing style/link tags to stop html2canvas from parsing oklch/modern CSS
        const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
        styles.forEach(s => s.remove());

        // Inject simple, standard CSS for the PDF template
        const s = clonedDoc.createElement('style');
        s.innerHTML = `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
          
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            color-scheme: light !important;
          }
          
          body {
            margin: 0;
            padding: 0;
            background: white !important;
            font-family: "Inter", -apple-system, sans-serif !important;
          }

          #${elementId} {
            width: 210mm !important;
            min-height: 297mm !important;
            background: white !important;
            padding: 40px !important;
            display: block !important;
            visibility: visible !important;
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
          }

          .flex { display: flex !important; }
          .flex-col { flex-direction: column !important; }
          .flex-wrap { flex-wrap: wrap !important; }
          .items-center { align-items: center !important; }
          .items-start { align-items: flex-start !important; }
          .justify-between { justify-content: space-between !important; }
          .justify-center { justify-content: center !important; }
          
          .grid { display: block !important; width: 100% !important; }
          .grid-cols-2 { display: table !important; width: 100% !important; table-layout: fixed !important; }
          .grid-cols-2 > div { display: table-cell !important; vertical-align: top !important; }
          .grid-cols-3 { display: table !important; width: 100% !important; table-layout: fixed !important; }
          .grid-cols-3 > div { display: table-cell !important; vertical-align: top !important; }
          
          .gap-2 { padding-right: 8px !important; }
          .gap-8 { padding-right: 32px !important; }
          .gap-10 { padding-right: 40px !important; }
          .gap-12 { padding-right: 48px !important; }
          
          .mb-1 { margin-bottom: 4px !important; }
          .mb-2 { margin-bottom: 8px !important; }
          .mb-4 { margin-bottom: 16px !important; }
          .mb-8 { margin-bottom: 32px !important; }
          .mb-10 { margin-bottom: 40px !important; }
          .mb-12 { margin-bottom: 48px !important; }
          .mb-16 { margin-bottom: 64px !important; }
          .mt-1 { margin-top: 4px !important; }
          .mt-4 { margin-top: 16px !important; }
          .mt-10 { margin-top: 40px !important; }
          .mt-20 { margin-top: 80px !important; }
          
          .p-3 { padding: 12px !important; }
          .p-4 { padding: 16px !important; }
          .p-6 { padding: 24px !important; }
          .p-8 { padding: 32px !important; }
          .p-10 { padding: 40px !important; }
          .p-12 { padding: 48px !important; }
          .pb-6 { padding-bottom: 24px !important; }
          .pb-8 { padding-bottom: 32px !important; }
          .pt-2 { padding-top: 8px !important; }
          .pt-3 { padding-top: 12px !important; }
          .pt-4 { padding-top: 16px !important; }
          .pt-8 { padding-top: 32px !important; }
          .pt-10 { padding-top: 40px !important; }
          .px-3 { padding-left: 12px !important; padding-right: 12px !important; }
          .py-1 { padding-top: 4px !important; padding-bottom: 4px !important; }
          
          .bg-white { background: #ffffff !important; }
          .bg-slate-50 { background: #f8fafc !important; }
          .bg-slate-900 { background: #0f172a !important; }
          .bg-blue-50 { background: #eff6ff !important; }
          
          .text-white { color: #ffffff !important; }
          .text-black { color: #000000 !important; }
          .text-slate-900 { color: #0f172a !important; }
          .text-slate-800 { color: #1e293b !important; }
          .text-slate-700 { color: #334155 !important; }
          .text-slate-600 { color: #475569 !important; }
          .text-slate-500 { color: #64748b !important; }
          .text-slate-400 { color: #94a3b8 !important; }
          .text-blue-600 { color: #2563eb !important; }
          .text-blue-700 { color: #1d4ed8 !important; }
          .text-blue-500 { color: #3b82f6 !important; }
          
          .border { border: 1px solid #e2e8f0 !important; }
          .border-b { border-bottom: 1px solid #e2e8f0 !important; }
          .border-b-2 { border-bottom: 2px solid #0f172a !important; }
          .border-b-4 { border-bottom: 4px solid #0f172a !important; }
          .border-t { border-top: 1px solid #0f172a !important; }
          .border-slate-100 { border: 1px solid #f1f5f9 !important; }
          .border-slate-200 { border: 1px solid #e2e8f0 !important; }
          .border-slate-900 { border: 1px solid #0f172a !important; }
          .border-blue-100 { border: 1px solid #dbeafe !important; }
          .border-collapse { border-collapse: collapse !important; }
          
          .text-right { text-align: right !important; }
          .text-center { text-align: center !important; }
          .text-left { text-align: left !important; }
          
          .text-xs { font-size: 11px !important; line-height: 1.4 !important; }
          .text-sm { font-size: 13px !important; line-height: 1.4 !important; }
          .text-base { font-size: 15px !important; line-height: 1.4 !important; }
          .text-lg { font-size: 18px !important; line-height: 1.2 !important; }
          .text-xl { font-size: 20px !important; line-height: 1.2 !important; }
          .text-2xl { font-size: 24px !important; line-height: 1.2 !important; }
          .text-4xl { font-size: 36px !important; line-height: 1 !important; }
          .text-[10px] { font-size: 10px !important; }
          .text-[9px] { font-size: 9px !important; }
          .text-[11px] { font-size: 11px !important; }
          
          .font-bold { font-weight: 700 !important; }
          .font-black { font-weight: 900 !important; }
          .italic { font-style: italic !important; }
          .uppercase { text-transform: uppercase !important; }
          .tracking-tighter { letter-spacing: -0.05em !important; }
          .tracking-widest { letter-spacing: 0.1em !important; }
          .tracking-tight { letter-spacing: -0.025em !important; }
          
          .rounded-lg { border-radius: 8px !important; }
          .rounded-xl { border-radius: 12px !important; }
          .rounded-2xl { border-radius: 16px !important; }
          .min-h-[60px] { min-height: 60px !important; }
          
          table { width: 100% !important; border-collapse: collapse !important; margin-bottom: 24px !important; }
          table th, table td { 
            padding: 12px !important; 
            border: 1px solid #e2e8f0 !important; 
            word-break: break-all !important;
          }
          table th { background-color: #0f172a !important; color: #ffffff !important; }
          
          .w-full { width: 100% !important; }
          .max-w-[200px] { max-width: 200px !important; }
        `;
        clonedDoc.head.appendChild(s);
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Fit to page with margins
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, (canvas.height * pdfWidth) / canvas.width);
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}
