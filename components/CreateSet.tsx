import React, { useState, useRef } from 'react';
import { Camera, Loader2, X, Save, ArrowLeft, Check, Upload } from 'lucide-react';
import { VocabItem, VocabSet, ExtractionResponse, SetMetadata } from '../types';
import { extractVocabularyFromImage } from '../services/geminiService';

interface CreateSetProps {
  onSave: (newSet: VocabSet) => void;
  onCancel: () => void;
}

export const CreateSet: React.FC<CreateSetProps> = ({ onSave, onCancel }) => {
  const [step, setStep] = useState<'CAPTURE' | 'DECISION' | 'PROCESSING' | 'EDIT'>('CAPTURE');
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [processingIndex, setProcessingIndex] = useState(0);
  const [extractedItems, setExtractedItems] = useState<VocabItem[]>([]);
  
  const [metaLanguage, setMetaLanguage] = useState('');
  const [metaGrade, setMetaGrade] = useState('8');
  const [metaChapter, setMetaChapter] = useState('');
  const [metaPage, setMetaPage] = useState('');

  const [error, setError] = useState<string | null>(null);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCapturedImages(prev => [...prev, base64String]);
        setStep('DECISION');
      };
      reader.readAsDataURL(file);
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = capturedImages.filter((_, idx) => idx !== indexToRemove);
    setCapturedImages(newImages);
    if (newImages.length === 0) {
      setStep('CAPTURE');
    }
  };

  const processAllImages = async () => {
    setStep('PROCESSING');
    setError(null);
    setProcessingIndex(0);

    let allItems: VocabItem[] = [];
    let foundLanguage = '';
    let foundGrade = '';
    let foundChapter = '';
    let foundPage = '';

    try {
      for (let i = 0; i < capturedImages.length; i++) {
        setProcessingIndex(i);
        const base64 = capturedImages[i];
        
        try {
          const result: ExtractionResponse = await extractVocabularyFromImage(base64);
          
          if (result.metadata) {
            const clean = (val: string | undefined | null) => {
                if (!val) return null;
                const s = String(val).trim();
                if (s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') return null;
                return s;
            };

            if (!foundLanguage) foundLanguage = clean(result.metadata.language) || '';
            if (!foundGrade) foundGrade = clean(result.metadata.grade) || '';
            if (!foundChapter) foundChapter = clean(result.metadata.chapter) || '';
            if (!foundPage) foundPage = clean(result.metadata.page) || '';
          }

          if (result.vocabulary && result.vocabulary.length > 0) {
             const newItems: VocabItem[] = result.vocabulary.map((item, itemIdx) => ({
              id: Date.now().toString() + "_" + i + "_" + itemIdx,
              original: item.original,
              translation: item.translation,
              correctCount: 0,
              wrongCount: 0
            }));
            allItems = [...allItems, ...newItems];
          }
        } catch (e) {
          console.error(`Error processing image ${i + 1}`, e);
        }
      }

      if (allItems.length === 0) {
        throw new Error("Auf den Fotos wurden keine Vokabeln erkannt.");
      }

      setExtractedItems(allItems);
      if (foundLanguage) setMetaLanguage(foundLanguage);
      if (foundGrade) setMetaGrade(foundGrade);
      if (foundChapter) setMetaChapter(foundChapter);
      if (foundPage) setMetaPage(foundPage);
      setStep('EDIT');

    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.");
      setStep('DECISION'); 
    }
  };

  const handleUpdateItem = (id: string, field: 'original' | 'translation', value: string) => {
    setExtractedItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleDeleteItem = (id: string) => {
    setExtractedItems(prev => prev.filter(item => item.id !== id));
  };

  const generateTitle = () => {
    const parts = [];
    if (metaLanguage) parts.push(metaLanguage);
    if (metaGrade) parts.push(`Klasse ${metaGrade}`);
    if (metaChapter) parts.push(`Kapitel ${metaChapter}`);
    if (metaPage) parts.push(`(S. ${metaPage})`);
    
    const title = parts.join(' - ');
    return title || `Vokabeln vom ${new Date().toLocaleDateString('de-DE')}`;
  };

  const handleSaveSet = () => {
    if (extractedItems.length === 0) return;

    const colors = ['bg-rose-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-pink-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const metadata: SetMetadata = {
      language: metaLanguage,
      grade: metaGrade,
      chapter: metaChapter,
      page: metaPage
    };

    const newSet: VocabSet = {
      id: Date.now().toString(),
      userId: '', // This will be filled by App.tsx before saving to storage
      title: generateTitle(),
      metadata: metadata,
      items: extractedItems,
      createdAt: Date.now(),
      color: randomColor
    };

    onSave(newSet);
  };

  if (step === 'PROCESSING') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-revo-emerald blur-xl opacity-20 rounded-full animate-pulse"></div>
          <Loader2 className="w-16 h-16 text-revo-emerald animate-spin relative z-10" />
        </div>
        <h2 className="text-xl font-bold mt-8 text-white">Verarbeite Seite {processingIndex + 1} von {capturedImages.length}...</h2>
        <p className="text-revo-text mt-2">Die KI extrahiert Vokabeln und fügt alles zusammen.</p>
        
        <div className="w-64 h-2 bg-revo-surface rounded-full mt-6 overflow-hidden">
           <div 
             className="h-full bg-revo-emerald transition-all duration-500"
             style={{ width: `${((processingIndex + 1) / capturedImages.length) * 100}%` }}
           ></div>
        </div>
      </div>
    );
  }

  if (step === 'DECISION') {
    return (
      <div className="max-w-md mx-auto p-4 flex flex-col min-h-[80vh]">
        <div className="flex-1 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-white mb-6">Fotos überprüfen</h2>
          
          <div className="grid grid-cols-2 gap-4 w-full mb-8">
            {capturedImages.map((img, idx) => (
              <div key={idx} className="relative group aspect-[3/4] rounded-2xl overflow-hidden border-2 border-revo-emerald/50 bg-revo-surface">
                <img src={img} alt={`Seite ${idx + 1}`} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md font-bold backdrop-blur-sm">
                  Seite {idx + 1}
                </div>
                <button 
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <div className="aspect-[3/4] rounded-2xl border-2 border-dashed border-revo-emerald/30 bg-revo-surface/50 flex flex-col items-center justify-center p-2 gap-2">
               <span className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Dazu:</span>
               <button 
                onClick={() => cameraInputRef.current?.click()}
                className="w-full flex-1 bg-revo-teal hover:bg-revo-emerald/50 text-slate-300 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors"
               >
                 <Camera className="w-5 h-5" />
                 <span className="text-xs font-bold">Kamera</span>
               </button>
               <button 
                onClick={() => galleryInputRef.current?.click()}
                className="w-full flex-1 bg-revo-teal hover:bg-revo-emerald/50 text-slate-300 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors"
               >
                 <Upload className="w-5 h-5" />
                 <span className="text-xs font-bold">Galerie</span>
               </button>
            </div>
          </div>

          {error && (
            <div className="bg-revo-error/20 text-revo-error p-4 rounded-xl text-sm font-medium border border-revo-error/50 mb-6 w-full">
              {error}
            </div>
          )}
        </div>

        <div className="space-y-3 pb-8">
           <div className="text-center text-slate-400 text-sm mb-4">
             Möchtest Du noch eine Seite hinzufügen oder den Scan starten?
           </div>
           
           <button 
             onClick={processAllImages}
             className="w-full py-4 bg-revo-emerald hover:bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-revo-teal/50 flex items-center justify-center gap-2 transition-transform active:scale-95 border border-revo-emerald"
           >
             <Check className="w-5 h-5" />
             Scan abschließen & Verarbeiten
           </button>
           
           <button 
             onClick={() => {
                setCapturedImages([]);
                setStep('CAPTURE');
             }}
             className="w-full py-3 text-slate-500 font-bold hover:text-white transition-colors"
           >
             Alles verwerfen
           </button>
        </div>

        <input 
            type="file" 
            ref={cameraInputRef}
            accept="image/*"
            capture="environment" 
            className="hidden"
            onChange={handleFileChange}
          />
        <input 
            type="file" 
            ref={galleryInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
      </div>
    );
  }

  if (step === 'EDIT') {
    return (
      <div className="max-w-3xl mx-auto p-4 pb-24">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => {
            if(confirm("Möchtest Du wirklich abbrechen? Die gescannten Daten gehen verloren.")) {
               onCancel();
            }
          }} className="p-2 hover:bg-revo-surface rounded-full text-slate-400 hover:text-white transition-colors">
             <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-white">Set bearbeiten</h2>
        </div>

        <div className="bg-revo-surface p-5 rounded-2xl shadow-lg border border-revo-emerald/20 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-revo-text uppercase tracking-wide block mb-1">Sprache</label>
              <input 
                value={metaLanguage}
                onChange={(e) => setMetaLanguage(e.target.value)}
                placeholder="z.B. Englisch"
                className="w-full bg-revo-teal border border-revo-emerald/50 rounded-lg px-3 py-2 font-semibold text-white placeholder-slate-500 focus:ring-1 focus:ring-revo-gold focus:border-revo-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-revo-text uppercase tracking-wide block mb-1">Klasse</label>
              <input 
                value={metaGrade}
                onChange={(e) => setMetaGrade(e.target.value)}
                placeholder="z.B. 7"
                className="w-full bg-revo-teal border border-revo-emerald/50 rounded-lg px-3 py-2 font-semibold text-white placeholder-slate-500 focus:ring-1 focus:ring-revo-gold focus:border-revo-gold focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-revo-text uppercase tracking-wide block mb-1">Kapitel</label>
              <input 
                value={metaChapter}
                onChange={(e) => setMetaChapter(e.target.value)}
                placeholder="z.B. 3"
                className="w-full bg-revo-teal border border-revo-emerald/50 rounded-lg px-3 py-2 font-semibold text-white placeholder-slate-500 focus:ring-1 focus:ring-revo-gold focus:border-revo-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-revo-text uppercase tracking-wide block mb-1">Seite</label>
              <input 
                value={metaPage}
                onChange={(e) => setMetaPage(e.target.value)}
                placeholder="z.B. 45"
                className="w-full bg-revo-teal border border-revo-emerald/50 rounded-lg px-3 py-2 font-semibold text-white placeholder-slate-500 focus:ring-1 focus:ring-revo-gold focus:border-revo-gold focus:outline-none"
              />
            </div>
          </div>
          
          <div className="pt-2 border-t border-revo-emerald/30 mt-2">
            <p className="text-xs text-slate-500">Vorschau Titel:</p>
            <p className="font-bold text-revo-gold">{generateTitle()}</p>
          </div>
        </div>

        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Vokabeln ({extractedItems.length})</h3>

        <div className="space-y-3">
          {extractedItems.map((item, idx) => (
            <div key={item.id} className="bg-revo-surface p-4 rounded-xl shadow-sm border border-revo-emerald/20 flex gap-4 items-start animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${Math.min(idx * 50, 1000)}ms` }}>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                   <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Fremdsprache</label>
                   <input 
                    value={item.original}
                    onChange={(e) => handleUpdateItem(item.id, 'original', e.target.value)}
                    className="w-full bg-revo-teal border border-revo-emerald/50 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-revo-gold focus:outline-none"
                   />
                </div>
                <div>
                   <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Übersetzung</label>
                   <input 
                    value={item.translation}
                    onChange={(e) => handleUpdateItem(item.id, 'translation', e.target.value)}
                    className="w-full bg-revo-teal border border-revo-emerald/50 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-revo-gold focus:outline-none"
                   />
                </div>
              </div>
              <button 
                onClick={() => handleDeleteItem(item.id)}
                className="mt-6 text-slate-500 hover:text-revo-error transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-revo-teal/95 backdrop-blur-md border-t border-revo-emerald/30 flex justify-center gap-4 z-20">
           <button 
             onClick={() => {
               if(confirm("Änderungen verwerfen?")) onCancel();
             }}
             className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:bg-revo-surface hover:text-white transition-colors"
           >
             Abbrechen
           </button>
           <button 
             onClick={handleSaveSet}
             disabled={extractedItems.length === 0}
             className="px-8 py-3 rounded-xl font-bold bg-revo-emerald text-white hover:bg-emerald-600 shadow-lg shadow-revo-teal disabled:opacity-50 disabled:shadow-none flex items-center gap-2 transition-all"
           >
             <Save className="w-5 h-5" />
             Speichern
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
       <div className="max-w-md w-full text-center space-y-8">
          <div>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-revo-surface text-revo-gold rounded-3xl mb-6 shadow-lg border border-revo-emerald/30">
              <Camera className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2">Vokabeln scannen</h1>
            <p className="text-revo-text">
              Fotografiere Dein Buch oder lade ein Bild von einer Vokabelliste hoch.
            </p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => cameraInputRef.current?.click()}
              className="w-full py-4 bg-revo-emerald hover:bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-revo-teal/50 transition-transform active:scale-95 flex items-center justify-center gap-2 border border-revo-emerald"
            >
              <Camera className="w-6 h-6" />
              Kamera öffnen
            </button>

            <button 
              onClick={() => galleryInputRef.current?.click()}
              className="w-full py-4 bg-revo-teal hover:bg-revo-surface text-revo-gold rounded-2xl font-bold text-lg border border-revo-emerald/50 hover:border-revo-gold/50 transition-colors active:scale-95 flex items-center justify-center gap-2"
            >
              <Upload className="w-6 h-6" />
              Bild hochladen
            </button>
            
            <button 
              onClick={onCancel}
              className="w-full py-4 text-slate-500 font-bold hover:text-white transition-colors mt-4"
            >
              Zurück
            </button>
          </div>

          <input 
            type="file" 
            ref={cameraInputRef}
            accept="image/*"
            capture="environment" 
            className="hidden"
            onChange={handleFileChange}
          />
          <input 
            type="file" 
            ref={galleryInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
       </div>
    </div>
  );
};