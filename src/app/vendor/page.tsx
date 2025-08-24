import Header from "@/components/app/Header";
import QrValidator from "@/components/app/QrValidator";

export default function VendorPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                <div className="max-w-2xl w-full">
                   <QrValidator />
                </div>
            </main>
        </div>
    )
}