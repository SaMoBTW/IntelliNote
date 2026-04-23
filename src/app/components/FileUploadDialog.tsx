import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Sparkles, FileText, Brain, Lightbulb } from 'lucide-react';
import { Card } from './ui/card';
import { motion } from 'motion/react';
import { useState } from 'react';

interface FileUploadDialogProps {
  open: boolean;
  onClose: () => void;
  fileName?: string;
}

type GenerationType = 'summary' | 'flashcards' | 'quiz' | 'all';

export function FileUploadDialog({ open, onClose, fileName = 'Document' }: FileUploadDialogProps) {
  const [selectedOptions, setSelectedOptions] = useState<Set<GenerationType>>(new Set(['all']));
  const [isProcessing, setIsProcessing] = useState(false);

  const options = [
    {
      id: 'summary' as GenerationType,
      title: 'Generate Summary',
      description: 'Create an AI-powered summary with key points',
      icon: FileText,
      color: 'primary',
    },
    {
      id: 'flashcards' as GenerationType,
      title: 'Create Flashcards',
      description: 'Generate flashcards for spaced repetition',
      icon: Brain,
      color: 'secondary',
    },
    {
      id: 'quiz' as GenerationType,
      title: 'Generate Quiz',
      description: 'Create a quiz to test your knowledge',
      icon: Lightbulb,
      color: 'accent',
    },
  ];

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
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            What would you like to create?
          </DialogTitle>
          <DialogDescription>
            Choose what AI features to generate for "{fileName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedOptions.has('all')
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">Generate Everything</h4>
                <p className="text-sm text-muted-foreground">
                  Create summary, flashcards, and quiz all at once
                </p>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedOptions.has('all')
                    ? 'border-primary bg-primary'
                    : 'border-border'
                }`}
              >
                {selectedOptions.has('all') && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3 h-3 rounded-full bg-white"
                  />
                )}
              </div>
            </div>
          </Card>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">Or choose specific options</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Individual Options */}
          <div className="space-y-3">
            {options.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedOptions.has(option.id);
              
              return (
                <Card
                  key={option.id}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => toggleOption(option.id)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-0.5">{option.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-border'
                      }`}
                    >
                      {isSelected && (
                        <motion.svg
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          className="w-3 h-3 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <motion.path
                            d="M5 13l4 4L19 7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </motion.svg>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            className="flex-1"
            disabled={selectedOptions.size === 0 || isProcessing}
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
