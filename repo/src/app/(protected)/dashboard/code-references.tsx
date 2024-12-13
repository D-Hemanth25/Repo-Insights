'use client'

import { Tabs, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

type Props = {
    fileReferences: { fileName: string; sourceCode: string; summary: string }[];
};

const CodeReferences = ({ fileReferences }: Props) => {
    const [tab, setTab] = React.useState(fileReferences[0]?.fileName || ''); // Default to the first file name

    if (fileReferences.length === 0) return null;

    return (
        <div className="max-w-[70vw]">
            <Tabs value={tab} onValueChange={(value) => setTab(value)}>
                {/* Render tab buttons */}
                <div className="overflow-scroll flex gap-2 bg-gray-200 p-1 rounded-md">
                    {fileReferences.map((file) => (
                        <button
                            key={file.fileName}
                            onClick={() => setTab(file.fileName)} // Update the tab when clicked
                            className={cn(
                                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap text-muted-foreground',
                                {
                                    'bg-primary text-primary-foreground': tab === file.fileName,
                                }
                            )}
                        >
                            {file.fileName}
                        </button>
                    ))}
                </div>

                {/* Render tab content */}
                {fileReferences.map((file) => (
                    <TabsContent
                        key={file.fileName}
                        value={file.fileName}
                        className="max-h-[40vh] overflow-scroll max-w-7xl rounded-md"
                    >
                        <SyntaxHighlighter language="typescript" style={materialDark}>
                            {file.sourceCode}
                        </SyntaxHighlighter>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};

export default CodeReferences;
