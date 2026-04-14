'use client';

interface BrandKitItem {
    id: string;
    name: string;
    description?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    accentColor?: string | null;
    preferredTone?: string | null;
    defaultCopyRules?: string[] | null;
    negativeRules?: string[] | null;
    fontPreferences?: string[] | null;
    isDefault?: boolean;
}

interface ProjectItem {
    id: string;
    name: string;
    description?: string | null;
    brandKitId?: string | null;
    status?: string;
    tags?: string[] | null;
}

interface ToneOption {
    id: string;
    label: string;
    description: string;
}

interface BrandKitDraft {
    name: string;
    primaryColor: string;
    secondaryColor: string;
    preferredTone: string;
}

interface ProjectDraft {
    name: string;
    description: string;
}

export function WorkspacePanel({
    showWorkspaceFeatures,
    showBrandFeatures,
    showProjectFeatures,
    selectedBrandKitId,
    selectedProjectId,
    workspaceError,
    brandKits,
    projects,
    showBrandKitForm,
    showProjectForm,
    isLoadingWorkspace,
    brandKitDraft,
    projectDraft,
    toneOptions,
    isSavingBrandKit,
    isSavingProject,
    setShowBrandKitForm,
    setShowProjectForm,
    setSelectedBrandKitId,
    setSelectedProjectId,
    setBrandKitDraft,
    setProjectDraft,
    handleCreateBrandKit,
    handleCreateProject,
}: {
    showWorkspaceFeatures: boolean;
    showBrandFeatures: boolean;
    showProjectFeatures: boolean;
    selectedBrandKitId: string;
    selectedProjectId: string;
    workspaceError: string | null;
    brandKits: BrandKitItem[];
    projects: ProjectItem[];
    showBrandKitForm: boolean;
    showProjectForm: boolean;
    isLoadingWorkspace: boolean;
    brandKitDraft: BrandKitDraft;
    projectDraft: ProjectDraft;
    toneOptions: ToneOption[];
    isSavingBrandKit: boolean;
    isSavingProject: boolean;
    setShowBrandKitForm: (updater: (current: boolean) => boolean) => void;
    setShowProjectForm: (updater: (current: boolean) => boolean) => void;
    setSelectedBrandKitId: (value: string) => void;
    setSelectedProjectId: (value: string) => void;
    setBrandKitDraft: (updater: (current: BrandKitDraft) => BrandKitDraft) => void;
    setProjectDraft: (updater: (current: ProjectDraft) => ProjectDraft) => void;
    handleCreateBrandKit: () => void;
    handleCreateProject: () => void;
}) {
    if (!showWorkspaceFeatures) {
        return null;
    }

    const currentBrandKit = selectedBrandKitId
        ? brandKits.find((item) => item.id === selectedBrandKitId)
        : null;
    const currentProject = selectedProjectId
        ? projects.find((item) => item.id === selectedProjectId)
        : null;

    return (
        <section className="overflow-hidden rounded-2xl border border-amber-100 bg-[linear-gradient(135deg,rgba(255,250,240,0.96),rgba(255,255,255,0.9)_45%,rgba(245,243,255,0.92)_100%)] shadow-sm transition-all duration-300 hover:border-amber-200">
            <div className="flex items-center justify-between border-b border-white/60 bg-white/50 px-6 py-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-sm font-bold text-white shadow-sm">1</div>
                    <div>
                        <h2 className="font-bold text-gray-900">ブランドと案件</h2>
                        <p className="mt-0.5 text-xs text-gray-500">毎回の入力を減らし、継続運用しやすくします</p>
                    </div>
                </div>
                {(selectedBrandKitId || selectedProjectId) && (
                    <div className="hidden items-center gap-2 sm:flex">
                        {showBrandFeatures && selectedBrandKitId && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">ブランド適用中</span>}
                        {showProjectFeatures && selectedProjectId && <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-semibold text-violet-700">案件保存先あり</span>}
                    </div>
                )}
            </div>

            <div className="space-y-5 px-6 py-6">
                {workspaceError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {workspaceError}
                    </div>
                )}

                <div className={`grid gap-5 ${showBrandFeatures && showProjectFeatures ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
                    {showBrandFeatures && (
                        <div className="rounded-2xl border border-amber-100 bg-white/80 p-4 shadow-sm">
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-gray-900">ブランドキット</p>
                                    <p className="mt-1 text-xs text-gray-500">色、トーン、世界観の初期値に使います</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowBrandKitForm((current) => !current)}
                                    className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
                                >
                                    {showBrandKitForm ? '閉じる' : '簡易作成'}
                                </button>
                            </div>

                            <div className="space-y-3">
                                <select
                                    value={selectedBrandKitId}
                                    onChange={(e) => setSelectedBrandKitId(e.target.value)}
                                    disabled={isLoadingWorkspace}
                                    className="w-full rounded-xl border border-amber-100 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-200/70 disabled:opacity-60"
                                >
                                    <option value="">ブランドキットを選択しない</option>
                                    {brandKits.map((item) => (
                                        <option key={item.id} value={item.id}>{item.name}</option>
                                    ))}
                                </select>

                                {currentBrandKit && (
                                    <div className="rounded-xl border border-amber-100 bg-[linear-gradient(135deg,rgba(255,247,237,0.92),rgba(255,255,255,0.96))] p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{currentBrandKit.name}</p>
                                                <p className="mt-1 text-xs text-gray-500">{currentBrandKit.description || 'ブランド説明なし'}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="h-5 w-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: currentBrandKit.primaryColor || '#FF6B35' }} />
                                                <span className="h-5 w-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: currentBrandKit.secondaryColor || '#7C3AED' }} />
                                                <span className="h-5 w-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: currentBrandKit.accentColor || '#111827' }} />
                                            </div>
                                        </div>
                                        <div className="mt-3 grid gap-2 text-[11px] text-gray-600 sm:grid-cols-2">
                                            <div className="rounded-lg bg-white/80 px-3 py-2">
                                                <span className="font-semibold text-gray-500">推奨トーン</span>
                                                <p className="mt-1 font-semibold text-gray-900">{currentBrandKit.preferredTone || '未設定'}</p>
                                            </div>
                                            <div className="rounded-lg bg-white/80 px-3 py-2">
                                                <span className="font-semibold text-gray-500">フォント指針</span>
                                                <p className="mt-1 font-semibold text-gray-900">{currentBrandKit.fontPreferences?.slice(0, 2).join(' / ') || '未設定'}</p>
                                            </div>
                                        </div>
                                        {(currentBrandKit.defaultCopyRules?.length || currentBrandKit.negativeRules?.length) && (
                                            <div className="mt-3 space-y-2">
                                                {currentBrandKit.defaultCopyRules?.length ? (
                                                    <div className="rounded-lg border border-amber-100 bg-white/80 px-3 py-2">
                                                        <p className="text-[11px] font-semibold text-amber-700">推奨コピー方針</p>
                                                        <p className="mt-1 text-[11px] leading-5 text-gray-700">{currentBrandKit.defaultCopyRules.slice(0, 2).join(' / ')}</p>
                                                    </div>
                                                ) : null}
                                                {currentBrandKit.negativeRules?.length ? (
                                                    <div className="rounded-lg border border-rose-100 bg-rose-50/70 px-3 py-2">
                                                        <p className="text-[11px] font-semibold text-rose-700">避ける表現</p>
                                                        <p className="mt-1 text-[11px] leading-5 text-gray-700">{currentBrandKit.negativeRules.slice(0, 2).join(' / ')}</p>
                                                    </div>
                                                ) : null}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {showBrandKitForm && (
                                    <div className="space-y-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                                        <input
                                            value={brandKitDraft.name}
                                            onChange={(e) => setBrandKitDraft((current) => ({ ...current, name: e.target.value }))}
                                            placeholder="例: Freshly Coffee"
                                            className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-200/70"
                                        />
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="mb-1 block text-[11px] font-semibold text-gray-500">Primary</label>
                                                <input type="color" value={brandKitDraft.primaryColor} onChange={(e) => setBrandKitDraft((current) => ({ ...current, primaryColor: e.target.value }))} className="h-11 w-full rounded-xl border border-amber-200 bg-white" />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[11px] font-semibold text-gray-500">Secondary</label>
                                                <input type="color" value={brandKitDraft.secondaryColor} onChange={(e) => setBrandKitDraft((current) => ({ ...current, secondaryColor: e.target.value }))} className="h-11 w-full rounded-xl border border-amber-200 bg-white" />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[11px] font-semibold text-gray-500">Tone</label>
                                                <select value={brandKitDraft.preferredTone} onChange={(e) => setBrandKitDraft((current) => ({ ...current, preferredTone: e.target.value }))} className="h-11 w-full rounded-xl border border-amber-200 bg-white px-3 text-sm text-gray-900 outline-none">
                                                    {toneOptions.map((tone) => (
                                                        <option key={tone.id} value={tone.id}>{tone.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <button type="button" onClick={handleCreateBrandKit} disabled={isSavingBrandKit} className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-bold text-white shadow-md transition hover:shadow-lg disabled:cursor-wait disabled:opacity-60">
                                            {isSavingBrandKit ? '保存中...' : 'ブランドキットを保存'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {showProjectFeatures && (
                        <div className="rounded-2xl border border-violet-100 bg-white/80 p-4 shadow-sm">
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-gray-900">プロジェクト</p>
                                    <p className="mt-1 text-xs text-gray-500">案件単位で生成履歴をまとめます</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowProjectForm((current) => !current)}
                                    className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 transition hover:bg-violet-100"
                                >
                                    {showProjectForm ? '閉じる' : '新規作成'}
                                </button>
                            </div>

                            <div className="space-y-3">
                                <select
                                    value={selectedProjectId}
                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                    disabled={isLoadingWorkspace}
                                    className="w-full rounded-xl border border-violet-100 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-200/70 disabled:opacity-60"
                                >
                                    <option value="">プロジェクトを選択しない</option>
                                    {projects.map((item) => (
                                        <option key={item.id} value={item.id}>{item.name}</option>
                                    ))}
                                </select>

                                {currentProject && (
                                    <div className="rounded-xl border border-violet-100 bg-[linear-gradient(135deg,rgba(245,243,255,0.92),rgba(255,255,255,0.96))] p-4">
                                        <p className="text-sm font-bold text-gray-900">{currentProject.name}</p>
                                        <p className="mt-1 text-xs text-gray-500">{currentProject.description || (currentProject.status === 'archived' ? 'archived' : 'active')}</p>
                                        {currentProject.tags?.length ? (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {currentProject.tags.slice(0, 3).map((tag) => (
                                                    <span key={tag} className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-semibold text-violet-700">{tag}</span>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                )}

                                {showProjectForm && (
                                    <div className="space-y-3 rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
                                        <input
                                            value={projectDraft.name}
                                            onChange={(e) => setProjectDraft((current) => ({ ...current, name: e.target.value }))}
                                            placeholder="例: 2026 春の新商品キャンペーン"
                                            className="w-full rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-200/70"
                                        />
                                        <textarea
                                            value={projectDraft.description}
                                            onChange={(e) => setProjectDraft((current) => ({ ...current, description: e.target.value }))}
                                            placeholder="案件メモや媒体メモ"
                                            rows={3}
                                            className="w-full resize-none rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-200/70"
                                        />
                                        <button type="button" onClick={handleCreateProject} disabled={isSavingProject} className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 py-3 text-sm font-bold text-white shadow-md transition hover:shadow-lg disabled:cursor-wait disabled:opacity-60">
                                            {isSavingProject ? '保存中...' : 'プロジェクトを保存'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
