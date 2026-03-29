import os

filepath = r"c:\Projects\gemini-cli-company-demo\apps\ad-image-generator\src\app\create\page.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Sidebar display (added after the tone summary section)
# Matches: <span className="font-medium text-gray-900">{toneOptions.find(t => t.id === formData.tone)?.label}</span>
sidebar_injection = """                                            {formData.customInstructions && (
                                                <div className="pt-3 mt-1 border-t border-gray-100 animate-fade-in">
                                                    <div className="flex items-center gap-1.5 mb-2">
                                                        <svg className="w-3.5 h-3.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-gray-500 font-semibold text-[10px] uppercase tracking-wider">カスタム指示</span>
                                                    </div>
                                                    <div className="p-3 bg-gray-50/80 border border-gray-200/60 border-dashed rounded-xl overflow-hidden">
                                                        <p className="font-semibold text-gray-700 text-[11px] leading-relaxed whitespace-pre-wrap break-all">
                                                            {formData.customInstructions}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}\n"""

# Result information (added after the tone summary in results section)
# Matches: <span className="font-medium">{toneOptions.find(t => t.id === formData.tone)?.label}</span>
result_injection = """                                        {formData.customInstructions && (
                                            <div className="col-span-2 pt-2 border-t border-gray-50 mt-1">
                                                <span className="text-gray-500 block mb-1">カスタム指示</span>
                                                <div className="p-2.5 bg-gray-50/60 border border-gray-100 border-dashed rounded-lg">
                                                    <p className="font-medium text-gray-700 text-[10px] leading-relaxed whitespace-pre-wrap break-all">
                                                        {formData.customInstructions}
                                                    </p>
                                                </div>
                                            </div>
                                        )}\n"""

# These line numbers are from the previous view_file (752 and 887 are the </div> tags)
# To insert AFTER line 752 (which is index 751), we insert at 752.
# However, we must ensure we are using the correct indices.
# In the original file read:
# 751: ...</span>
# 752: </div>
# So we want to insert AFTER 752. This is index 752.

# In the original file read:
# 886: ...</span>
# 887: </div>
# So we want to insert AFTER 887. This is index 887.

# Inserting from bottom to bottom avoids index shifts.
lines.insert(887, result_injection)
lines.insert(752, sidebar_injection)

with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
    f.writelines(lines)

print("Successfully applied visibility enhancements to CreatePage.tsx")
