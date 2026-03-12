'use client';

import { AD_OBJECTIVES, AdObjectiveId } from '../types';
import { Check } from 'lucide-react';

interface Props {
    selectedObjective: AdObjectiveId;
    onChange: (id: AdObjectiveId) => void;
}

export function ObjectiveSelector({ selectedObjective, onChange }: Props) {
    const selectedObj = AD_OBJECTIVES.find(obj => obj.id === selectedObjective);

    return (
        <section className={`bg-white/70 backdrop-blur-sm rounded-2xl border overflow-hidden transition-all duration-300 border-blue-500 shadow-md ring-1 ring-blue-500/20`}>
            <div className="w-full px-6 py-4 flex items-center justify-between bg-blue-50/30">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                        1
                    </div>
                    <div className="text-left">
                        <h2 className="font-bold text-gray-900">広告の目的を選択</h2>
                        {selectedObj && (
                            <p className="text-xs text-gray-500 mt-0.5">
                                {selectedObj.icon} {selectedObj.name}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {selectedObj && (
                        <span className="px-2.5 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-full hidden sm:inline-block">
                            ✓ 選択済み
                        </span>
                    )}
                </div>
            </div>

            <div className="px-6 pb-6 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {AD_OBJECTIVES.map((obj) => (
                            <button
                                key={obj.id}
                                onClick={() => onChange(obj.id as AdObjectiveId)}
                                type="button"
                                className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${selectedObjective === obj.id
                                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md shadow-blue-500/10'
                                    : 'border-gray-100 bg-white/70 hover:border-gray-200 hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-2xl">{obj.icon}</span>
                                    {selectedObjective === obj.id && (
                                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white p-0.5">
                                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm mb-1">{obj.name}</h3>
                                <p className="text-xs text-gray-500 leading-relaxed text-balance line-clamp-2">
                                    {obj.description}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
        </section>
    );
}
