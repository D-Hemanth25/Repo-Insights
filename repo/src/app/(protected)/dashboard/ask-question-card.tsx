'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import useProject from "@/hooks/use-project"
import { Button } from "@/components/ui/button"
import React from "react";
import MDEditor from "@uiw/react-md-editor"
import { Dialog, DialogHeader } from "@/components/ui/dialog";
import { DialogContent, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"
import { askQuestion } from "./actions"
import { readStreamableValue } from "ai/rsc"
import CodeReferences from "./code-references"

const AskQuestionCard = () => {
    const { project } = useProject();
    const [question, setQuestion] = React.useState("");
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [filesReferences, setFilesReferences] = React.useState<
        { fileName: string; sourceCode: string; summary: string }[]
    >([]);
    const [answer, setAnswer] = React.useState("");

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setAnswer("");
        setFilesReferences([]);
        e.preventDefault();
        if (!project?.id) return;
        setLoading(true);

        const { output, filesReferences } = await askQuestion(question, project.id);
        setOpen(true);
        setFilesReferences(filesReferences);

        (async () => {
            for await (const delta of readStreamableValue(output)) {
                if (delta) {
                    setAnswer((ans) => ans + delta);
                }
            }
            setLoading(false);
        })();
    };

    return (
        <>
            {/* <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[80vw]">
                    <DialogHeader>
                        <DialogTitle>
                            <Image src={"/logo.jpg"} alt="logo" width={40} height={40} />
                        </DialogTitle>
                    </DialogHeader>
                    <MDEditor.Markdown
                        source={answer}
                        className="max-w-[70vw] !h-full max-h-[40vh] overflow-scroll p-5"
                    />
                    <div className="h-4"></div>
                    <CodeReferences fileReferences={filesReferences} />
                    <Button type="button" onClick={() => setOpen(false)}>
                        Close
                    </Button>
                    <h1>File References</h1>
                    {filesReferences.map((file, index) => (
                        <span key={file.fileName || index}>{file.fileName}</span>
                    ))}
                </DialogContent>
            </Dialog> */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[80vw] flex flex-col h-[100vh]">
                    {/* Header with Fixed Logo */}
                    <DialogHeader className="flex-none">
                        <DialogTitle className="flex items-center gap-2">
                            <Image src="/logo.jpg" alt="logo" width={40} height={40} />
                            <span className="text-lg font-semibold">File References</span>
                        </DialogTitle>
                    </DialogHeader>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <MDEditor.Markdown
                            source={answer}
                            className="max-w-[70vw] !h-full max-h-[40vh] overflow-scroll p-5"
                        />
                        <div className="h-4"></div>
                        <CodeReferences fileReferences={filesReferences} />
                    </div>

                    {/* Footer */}
                    <div className="flex-none mt-4">
                        <Button type="button" onClick={() => setOpen(false)}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>


            <Card className="relative col-span-5">
                <CardHeader>
                    <CardTitle>Ask a question</CardTitle>
                    <CardContent>
                        <form onSubmit={onSubmit}>
                            <Textarea
                                placeholder="Which file should I edit to change the homepage?"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                            />
                            <div className="h-4"></div>
                            <Button type="submit" disabled={loading}>
                                Get Insights!
                            </Button>
                        </form>
                    </CardContent>
                </CardHeader>
            </Card>
        </>
    );
};

export default AskQuestionCard;
