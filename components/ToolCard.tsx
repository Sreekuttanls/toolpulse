import Link from "next/link";
import { Tool } from "@/app/actions/search";
import { ExternalLink } from "lucide-react";

export function ToolCard({ tool }: { tool: Tool }) {
    // Truncate description slightly if needed
    const desc = tool.description.length > 150 ? tool.description.substring(0, 150) + "..." : tool.description;

    return (
        <div className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg hover:-translate-y-1">
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl uppercase">
                        {tool.name.charAt(0)}
                    </div>
                    {tool.similarity && tool.similarity > 0.5 && (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Best Match
                        </span>
                    )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    <a href={tool.website_url} target="_blank" rel="noopener noreferrer" className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        {tool.name}
                    </a>
                </h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                    {desc}
                </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium text-gray-400 group-hover:text-indigo-500">
                Visit Website <ExternalLink className="ml-1 h-3 w-3" />
            </div>
        </div>
    );
}
