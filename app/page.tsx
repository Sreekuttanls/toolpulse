'use client';

import { useState, useTransition, useEffect } from 'react';
import { searchTools, Tool, getCategories, getTools } from '@/app/actions/search';
import { Input } from '@/components/ui/input';
import { ToolCard } from '@/components/ToolCard';
import { Sparkles, Loader2, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isPending, startTransition] = useTransition();
  const [isSearching, setIsSearching] = useState(false);

  // Initial Load
  useEffect(() => {
    async function init() {
      try {
        console.log('Initializing... calling server actions');
        const [cats, tools] = await Promise.all([
          getCategories(),
          getTools('All')
        ]);
        console.log('Received:', { cats, tools });
        setCategories(['All', ...cats]);
        setResults(tools);
      } catch (e) {
        console.error('Init error:', e);
      }
    }
    init();
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!query.trim()) {
        loadCategory('All');
        return;
      }
      setIsSearching(true);
      startTransition(async () => {
        const tools = await searchTools(query);
        setResults(tools);
      });
    }
  };

  const loadCategory = async (cat: string) => {
    setSelectedCategory(cat);
    setQuery(''); // Clear search when picking category
    setIsSearching(false);

    const tools = await getTools(cat);
    setResults(tools);
  };

  const clearSearch = () => {
    setQuery('');
    loadCategory('All');
  };

  return (
    <main className="min-h-screen bg-neutral-50 selection:bg-indigo-100 selection:text-indigo-900 pb-20">
      {/* Background Gradients */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-neutral-50">
        <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(100%_50%_at_50%_0%,rgba(99,102,241,0.13)_0,rgba(0,163,255,0)_50%,rgba(0,163,255,0)_100%)]"></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header & Search - Full Width */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center rounded-full border border-indigo-200 bg-white/50 px-3 py-1 text-sm text-indigo-800 backdrop-blur-md">
            <Sparkles className="mr-2 h-3 w-3" />
            AI-Powered Discovery
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Tool Pulse: <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">Find the perfect tool</span>
          </h1>

          <div className="max-w-2xl mx-auto relative mt-8">
            <Input
              startIcon={<Search className="h-4 w-4" />}
              placeholder="Describe what you want to achieve..."
              className="h-14 text-lg shadow-xl border-indigo-100 bg-white focus-visible:ring-indigo-500 rounded-2xl pl-12"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              disabled={isPending}
            />
            {query && (
              <button onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            )}
            {isPending && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar - Categories */}
          <aside className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-8 max-h-[80vh] overflow-hidden flex flex-col">
              <h3 className="font-semibold text-gray-900 mb-4 px-2">Categories</h3>
              <div className="flex flex-col space-y-1 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => loadCategory(cat)}
                    className={cn(
                      "text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors truncate w-full",
                      selectedCategory === cat
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    title={cat}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="pt-4 mt-2 border-t border-gray-100">
                <a
                  href="/submit"
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Submit a Tool
                </a>
              </div>
            </div>
          </aside>

          {/* Main Content - Results */}
          <section className="lg:col-span-9">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-xl font-bold text-gray-900">
                  {isSearching ? 'Search Results' : (selectedCategory === 'All' ? 'All Tools' : `${selectedCategory}`)}
                </h2>
                <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                  {results.length} tools
                </span>
              </div>

              {results.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                  <p className="text-gray-500">No tools found. Try searching for something else!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {results.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
