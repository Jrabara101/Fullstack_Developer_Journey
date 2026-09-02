import React, { useState } from 'react';
import { useCommerce } from '../../context/CommerceContext';

export const PosSimulatorModal: React.FC = () => {
    const { isPosModalOpen, setIsPosModalOpen, executePosCheckout, switchView } = useCommerce();
    const [selectedItemId, setSelectedItemId] = useState<number>(1);
    const [qty, setQty] = useState<number>(1);

    if (!isPosModalOpen) return null;

    const handleProcessSale = () => {
        executePosCheckout(selectedItemId, qty);
        switchView('oms');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-emerald-600 text-white">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
                        <h2 className="font-bold text-sm">Retail POS API Terminal #3</h2>
                    </div>
                    <button
                        onClick={() => setIsPosModalOpen(false)}
                        className="p-1 rounded text-white/80 hover:text-white"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
                <div className="p-5 space-y-4 text-xs">
                    <p className="text-slate-600 dark:text-slate-300">
                        Simulate a walk-in retail customer purchasing directly at the brick-and-mortar register. Observe real-time buffer stock deductions and optimistic webhook sync.
                    </p>
                    <div className="space-y-2">
                        <label className="font-semibold text-slate-800 dark:text-slate-200 block">
                            Select Barcode / Item
                        </label>
                        <select
                            value={selectedItemId}
                            onChange={(e) => setSelectedItemId(parseInt(e.target.value))}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-800 dark:text-slate-200"
                        >
                            <option value={1}>SKU: AU-ANC-BLK - Aura ANC Headphones ($199)</option>
                            <option value={2}>SKU: CBL-USBC-2M - Braided USB-C Cable ($25)</option>
                            <option value={3}>SKU: WCH-MAG-TRI - Magnetic 3-in-1 Charging Stand ($89)</option>
                            <option value={4}>SKU: WCH-TITAN-X - Chrono Titan Smart Watch ($299)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="font-semibold text-slate-800 dark:text-slate-200 block">Quantity</label>
                        <input
                            type="number"
                            min="1"
                            max="5"
                            value={qty}
                            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-800 dark:text-slate-200"
                        />
                    </div>
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-end gap-2">
                    <button
                        onClick={() => setIsPosModalOpen(false)}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 dark:text-slate-300 text-xs font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleProcessSale}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined text-[16px]">barcode_scanner</span>
                        <span>Process Counter Sale</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
