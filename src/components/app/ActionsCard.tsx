
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, QrCode, Sparkles } from 'lucide-react';
import { useState } from 'react';
import AddTokensDialog from './AddTokensDialog';
import PayVendorDialog from './PayVendorDialog';
import AiSuggestionDialog from './AiSuggestionDialog';

export default function ActionsCard() {
    const [addTokensOpen, setAddTokensOpen] = useState(false);
    const [payVendorOpen, setPayVendorOpen] = useState(false);
    const [aiSuggestionOpen, setAiSuggestionOpen] = useState(false);

  return (
    <>
        <Card className="shadow-md rounded-xl">
        <CardHeader>
            <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
            <Button size="lg" className="w-full justify-start" onClick={() => setAddTokensOpen(true)}>
            <PlusCircle className="mr-2 h-5 w-5" /> Add Tokens
            </Button>
            <Button size="lg" className="w-full justify-start" onClick={() => setPayVendorOpen(true)}>
            <QrCode className="mr-2 h-5 w-5" /> Scan QR
            </Button>
            <Button size="lg" variant="outline" className="w-full justify-start" onClick={() => setAiSuggestionOpen(true)}>
            <Sparkles className="mr-2 h-5 w-5 text-primary" /> Get Suggestion
            </Button>
        </CardContent>
        </Card>
        <AddTokensDialog open={addTokensOpen} onOpenChange={setAddTokensOpen} />
        <PayVendorDialog open={payVendorOpen} onOpenChange={setPayVendorOpen} />
        <AiSuggestionDialog open={aiSuggestionOpen} onOpenChange={setAiSuggestionOpen} />
    </>
  );
}
