import React, { useRef, useState } from 'react';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { getItems } from '../services/storage';
import { Item } from '../types';

const DataManagement: React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleExport = () => {
        try {
            const items = getItems();
            const dataStr = JSON.stringify(items, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `reima-resale-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setMessage({ type: 'success', text: 'Data úspěšně exportována.' });
        } catch (e) {
            setMessage({ type: 'error', text: 'Chyba při exportu dat.' });
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const parsed = JSON.parse(content);

                if (!Array.isArray(parsed)) {
                    throw new Error('Neplatný formát dat (očekáváno pole).');
                }

                // Basic validation of the first item if exists
                if (parsed.length > 0 && (!parsed[0].id || !parsed[0].name)) {
                    throw new Error('Neplatná struktura dat.');
                }

                localStorage.setItem('resale_tracker_items', JSON.stringify(parsed));
                window.dispatchEvent(new Event('storage-update'));
                setMessage({ type: 'success', text: 'Data úspěšně importována.' });

                // Reset input
                if (fileInputRef.current) fileInputRef.current.value = '';
            } catch (err) {
                console.error(err);
                setMessage({ type: 'error', text: 'Chyba při importu: Neplatný soubor.' });
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="px-5 pt-8 pb-24 animate-fade-in">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-ios-text">Správa dat</h1>
                <p className="text-ios-textSec text-sm mt-1">Zálohování a obnova</p>
            </header>

            <div className="space-y-4">
                {/* Export Card */}
                <div className="bg-ios-card rounded-2xl p-5 shadow-ios-card">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-ios-blue/10 p-2 rounded-full">
                            <Download className="text-ios-blue" size={24} />
                        </div>
                        <h3 className="text-lg font-semibold">Exportovat data</h3>
                    </div>
                    <p className="text-sm text-ios-textSec mb-4">
                        Stáhněte si zálohu všech vašich položek do souboru JSON.
                    </p>
                    <button
                        onClick={handleExport}
                        className="w-full bg-ios-blue text-white font-semibold py-3 rounded-xl active:scale-95 transition-transform"
                    >
                        Stáhnout zálohu
                    </button>
                </div>

                {/* Import Card */}
                <div className="bg-ios-card rounded-2xl p-5 shadow-ios-card">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-ios-green/10 p-2 rounded-full">
                            <Upload className="text-ios-green" size={24} />
                        </div>
                        <h3 className="text-lg font-semibold">Importovat data</h3>
                    </div>
                    <p className="text-sm text-ios-textSec mb-4">
                        Nahrajte dříve stažený soubor zálohy. <br />
                        <span className="text-ios-red font-medium">Pozor: Přepíše současná data!</span>
                    </p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".json"
                        className="hidden"
                    />
                    <button
                        onClick={handleImportClick}
                        className="w-full bg-ios-gray text-ios-text font-semibold py-3 rounded-xl active:scale-95 transition-transform"
                    >
                        Nahrát ze souboru
                    </button>
                </div>

                {/* Message Toast */}
                {message && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <span className="text-sm font-medium">{message.text}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataManagement;
