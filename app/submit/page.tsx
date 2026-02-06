'use client';

import { useActionState } from 'react';
import { submitTool } from '@/app/actions/submit';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, Sparkles, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const initialState = {
    message: '',
    error: '',
    success: false
};

export default function SubmitPage() {
    const [state, formAction, isPending] = useActionState(submitTool, initialState);

    return (
        <main className="min-h-screen bg-neutral-50 py-12 px-4 selection:bg-indigo-100 selection:text-indigo-900">
            <div className="max-w-xl mx-auto">
                <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-8 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Search
                </Link>

                <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
                    <div className="bg-indigo-50/50 p-8 border-b border-indigo-100">
                        <div className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 mb-4">
                            <Sparkles className="mr-1.5 h-3 w-3" />
                            Add to Database
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Submit a Tool</h1>
                        <p className="text-gray-600 mt-2">
                            Add a new tool to the finder. It will be instantly indexed for AI search.
                        </p>
                    </div>

                    <div className="p-8">
                        {state?.success ? (
                            <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
                                <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Submitted Successfully!</h3>
                                <p className="text-gray-500 mb-6">{state.message}</p>
                                <Link
                                    href="/"
                                    className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-full"
                                >
                                    Go to Home
                                </Link>
                            </div>
                        ) : (
                            <form action={formAction} className="space-y-6">
                                {state?.error && (
                                    <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
                                        {state.error}
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Tool Name
                                    </label>
                                    <Input
                                        type="text"
                                        name="name"
                                        id="name"
                                        placeholder="e.g. Notion"
                                        className="bg-gray-50 border-gray-200 focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                                        Website URL <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="url"
                                        name="url"
                                        id="url"
                                        required
                                        placeholder="https://example.com"
                                        className="bg-gray-50 border-gray-200 focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-1">
                                        Tagline (Optional)
                                    </label>
                                    <Input
                                        type="text"
                                        name="tagline"
                                        id="tagline"
                                        placeholder="Short punchy description"
                                        className="bg-gray-50 border-gray-200 focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        id="description"
                                        required
                                        rows={4}
                                        placeholder="Describe what the tool does, who it is for, and key features. This is used for AI Search."
                                        className={cn(
                                            "flex w-full rounded-xl border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                            "bg-gray-50 border-gray-200 focus:bg-white resize-none text-gray-900"
                                        )}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-1">
                                        Categories
                                    </label>
                                    <Input
                                        type="text"
                                        name="categories"
                                        id="categories"
                                        placeholder="e.g. CRM, Video, Sales (comma separated)"
                                        className="bg-gray-50 border-gray-200 focus:bg-white"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Separate multiple categories with commas.</p>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className="flex w-full justify-center items-center rounded-xl bg-indigo-600 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                    >
                                        {isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Generating Embeddings...
                                            </>
                                        ) : (
                                            'Submit Tool'
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
