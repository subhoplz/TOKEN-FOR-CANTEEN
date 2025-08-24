
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils } from "lucide-react";

export default function MenuCard() {

    return (
        <Card className="shadow-md rounded-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-primary" /> Today's Menu
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-baseline">
                    <p className="font-semibold text-muted-foreground">Breakfast</p>
                    <p className="text-right">Idli + Sambar</p>
                </div>
                 <div className="flex justify-between items-baseline">
                    <p className="font-semibold text-muted-foreground">Lunch</p>
                    <p className="text-right">Rice + Curry</p>
                </div>
                 <div className="flex justify-between items-baseline">
                    <p className="font-semibold text-muted-foreground">Dinner</p>
                    <p className="text-right">Chapati + Paneer</p>
                </div>
            </CardContent>
        </Card>
    )
}
