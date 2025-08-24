"use client";

import { useState } from 'react';
import { useCanteenPass } from '@/hooks/use-canteen-pass';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { suggestTokenPurchase, SuggestTokenPurchaseOutput } from '@/ai/flows/suggest-token-purchase';
import { Loader2, Sparkles } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface AiSuggestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AiSuggestionDialog({ open, onOpenChange }: AiSuggestionDialogProps) {
  const [suggestion, setSuggestion] = useState<SuggestTokenPurchaseOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const { balance, getSpendingHabits } = useCanteenPass();
  const { toast } = useToast();

  const handleGetSuggestion = async () => {
    setLoading(true);
    setSuggestion(null);
    try {
      const spendingHabits = getSpendingHabits();
      const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
      const availableMenus = "Today's menu includes: Sandwich (15 tokens), Salad (20 tokens), Full Meal (35 tokens), Snacks (5-10 tokens).";
      
      const result = await suggestTokenPurchase({
        spendingHabits,
        dayOfWeek,
        availableMenus,
        currentBalance: balance,
      });

      setSuggestion(result);
    } catch (error) {
      console.error("AI suggestion failed:", error);
      toast({
        title: 'Suggestion Failed',
        description: 'Could not get a suggestion at this time.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    setSuggestion(null);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" /> AI Purchase Suggestion
          </DialogTitle>
          <DialogDescription>
            Let our AI analyze your habits and suggest an optimal token purchase amount.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
            <div className='flex items-center justify-center h-40'>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : suggestion ? (
            <div className='py-4 space-y-4'>
                <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertTitle>Suggestion</AlertTitle>
                    <AlertDescription>
                        Purchase <strong className='font-headline text-lg'>{suggestion.suggestedPurchaseAmount}</strong> tokens.
                    </AlertDescription>
                </Alert>
                <div className='text-sm text-muted-foreground p-4 bg-secondary rounded-md'>
                    <p className='font-semibold text-foreground mb-2'>Reasoning:</p>
                    {suggestion.reasoning}
                </div>
            </div>
        ) : (
            <div className='flex items-center justify-center h-40'>
                 <Button onClick={handleGetSuggestion} disabled={loading}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : "Get my suggestion"}
                </Button>
            </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Close</Button>
          {!loading && !suggestion && <Button onClick={handleGetSuggestion}>Get Suggestion</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
