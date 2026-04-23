import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Sparkles, Upload, FileText, Brain, Lightbulb, X } from 'lucide-react';
import { Card } from './ui/card';
import { motion } from 'motion/react';
import { useState, useRef } from 'react';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface AddContentDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'summary' | 'flashcards' | 'quiz' | 'library';
  /** When set (library mode), persists a document instead of simulating processing. */
  onLibraryAdd?: (input: {
    title: string;
    type: string;
    body_text?: string | null;
  }) => Promise<void>;
}

type GenerationType = 'summary' | 'flashcards' | 'quiz' | 'all';

export function AddContentDialog({ open, onClose, mode, onLibraryAdd }: AddContentDialogProps) {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'text'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [textTitle, setTextTitle] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Set<GenerationType>>(
    new Set([mode === 'library' ? 'all' : mode])
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const options = [
    {
      id: 'summary' as GenerationType,
      title: 'Generate Summary',
      description: 'Create an AI-powered summary with key points',
      icon: FileText,
    },
    {
      id: 'flashcards' as GenerationType,
      title: 'Create Flashcards',
      description: 'Generate flashcards for spaced repetition',
      icon: Brain,
    },
    {
      id: 'quiz' as GenerationType,
      title: 'Generate Quiz',
      description: 'Create a quiz to test your knowledge',
      icon: Lightbulb,
    },
  ];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const toggleOption = (id: GenerationType) => {
    const newSelected = new Set(selectedOptions);
    
    if (id === 'all') {
      if (selectedOptions.has('all')) {
        newSelected.clear();
      } else {
        newSelected.clear();
        newSelected.add('all');
      }
    } else {
      newSelected.delete('all');
      if (selectedOptions.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      // If all individual options are selected, switch to "all"
      if (newSelected.size === 3) {
        newSelected.clear();
        newSelected.add('all');
      }
    }

    setSelectedOptions(newSelected);
  };

  const handleGenerate = async () => {
    setIsProcessing(true);
    try {
      if (mode === 'library' && onLibraryAdd) {
        if (uploadMethod === 'file' && selectedFile) {
          const base =
            selectedFile.name.replace(/\.[^/.]+$/, '') || selectedFile.name;
          const ext = (selectedFile.name.split('.').pop() ?? 'file').toUpperCase();
          await onLibraryAdd({ title: base, type: ext, body_text: null });
        } else {
          await onLibraryAdd({
            title: textTitle.trim(),
            type: 'Text',
            body_text: textContent.trim() || null,
          });
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      onClose();
      setSelectedFile(null);
      setTextContent('');
      setTextTitle('');
      setUploadMethod('file');
    } finally {
      setIsProcessing(false);
    }
  };

  const canGenerate = () => {
    if (uploadMethod === 'file') {
      return selectedFile !== null && selectedOptions.size > 0;
    }
    return textContent.trim().length > 0 && textTitle.trim().length > 0 && selectedOptions.size > 0;
  };

  const getTitle = () => {
    switch (mode) {
      case 'summary':
        return 'Add Content for Summary';
      case 'flashcards':
        return 'Add Content for Flashcards';
      case 'quiz':
        return 'Add Content for Quiz';
      default:
        return 'Add New Content';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'summary':
        return 'Upload a document or paste text to generate an AI summary';
      case 'flashcards':
        return 'Upload a document or paste text to generate flashcards';
      case 'quiz':
        return 'Upload a document or paste text to generate a quiz';
      default:
        return 'Upload a document or paste text to generate AI study materials';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {getTitle()}
          </DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Upload Method Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setUploadMethod('file')}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                uploadMethod === 'file'
                  ? 'bg-background shadow-sm'
                  : 'hover:bg-background/50'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload File
            </button>
            <button
              onClick={() => setUploadMethod('text')}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                uploadMethod === 'text'
                  ? 'bg-background shadow-sm'
                  : 'hover:bg-background/50'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Paste Text
            </button>
          </div>

          {/* File Upload */}
          {uploadMethod === 'file' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {!selectedFile ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 hover:bg-accent/50'
                  }`}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h4 className="mb-2">Drop your file here</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports PDF, DOC, DOCX, TXT
                  </p>
                </div>
              ) : (
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="truncate">{selectedFile.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Text Input */}
          {uploadMethod === 'text' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Biology Chapter 5"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Paste your study material here..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows={10}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {textContent.length} characters
                </p>
              </div>
            </div>
          )}

          {/* Generation Options */}
          {mode === 'library' && (
            <>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground">What to generate</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="space-y-3">
                {/* All Option */}
                <Card
                  className={`p-4 cursor-pointer transition-all ${
                    selectedOptions.has('all')
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => toggleOption('all')}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedOptions.has('all')
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-0.5">Generate Everything</h4>
                      <p className="text-sm text-muted-foreground">
                        Create summary, flashcards, and quiz all at once
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedOptions.has('all')
                          ? 'border-primary bg-primary'
                          : 'border-border'
                      }`}
                    >
                      {selectedOptions.has('all') && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2.5 h-2.5 rounded-sm bg-white"
                        />
                      )}
                    </div>
                  </div>
                </Card>

                {/* Individual Options */}
                {options.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedOptions.has(option.id);
                  
                  return (
                    <Card
                      key={option.id}
                      className={`p-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => toggleOption(option.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{option.title}</h4>
                        </div>
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-primary bg-primary'
                              : 'border-border'
                          }`}
                        >
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 rounded-sm bg-white"
                            />
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            className="flex-1"
            disabled={!canGenerate() || isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="animate-shimmer w-4 h-4 rounded-full mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
