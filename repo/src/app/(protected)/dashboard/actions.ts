'use server'

import { streamText } from "ai"
import { createStreamableValue } from "ai/rsc"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateEmbedding } from "@/lib/gemini"
import { db } from "@/server/db"

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
})

export async function askQuestion(question: string, projectId: string){
    const stream = createStreamableValue()

    const queryVector = await generateEmbedding(question)
    const vectorQuery = `[${queryVector.join(',')}]`

    const result = await db.$queryRaw`
    SELECT "fileName", "sourceCode", "summary",
    1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
    FROM "sourceCodeEmbedding"
    WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.5
    AND "projectId" = ${projectId}
    ORDER BY similarity DESC
    LIMIT 10
    ` as { fileName: string; sourceCode: string; summary: string }[]

    let context = ""

    for (const doc of result){
        context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\nsummary of file: ${doc.summary}\n\n`
    }

    (async() => {
        const { textStream } = await streamText({
            model: google('gemini-1.5-flash'),
            prompt:`
            You are a technical AI code assistant designed to help interns and developers understand codebases, provide detailed explanations, and offer guidance on code-related questions.
            Your core traits are:
            - Expert technical knowledge\n
            - Precise and detailed explanations\n
            - Patient and supportive communication style\n
            - Focus on clarity and educational value\n

            ## Response Guidelines
            1. Always base responses strictly on the provided context
            2. Use markdown formatting for readability
            3. Include code snippets when relevant
            4. Provide step-by-step explanations
            5. Aim for technical accuracy and depth

            ## Interaction Principles
            - If the context doesn't contain the answer, clearly state: "I cannot find the answer in the provided context."
            - Never fabricate information
            - Prioritize helping the user understand the code or concept
            - Adapt explanation complexity to the user's apparent technical level

            - Carefully analyze the provided context block
            - Reference specific parts of the context in your response
            - If multiple interpretations are possible, explain potential variations

            START CONTEXT BLOCK
            ${context}
            END OF CONTEXT BLOCK
            

            START QUESTION
            ${question}
            END OF QUESTION

            ## Response Format
            - Use clear headings
            - Leverage code blocks
            - Include explanatory text
            - Provide context for code examples


            ## Example Response Structure
            ### Question Overview
            *Brief restatement of the question*

            ### Detailed Explanation
            - Relevant context details
            - Step-by-step breakdown
            - Code examples

            ### Potential Implications or Next Steps
            *Additional insights or recommendations*
            `
        })

        for await (const delta of textStream){
            stream.update(delta)
        }

        stream.done()
    })()

    return {
        output: stream.value,
        filesReferences: result
    }
}