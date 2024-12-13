import { db } from "@/server/db";
import { Octokit } from "octokit";
import axios from "axios";
import { aiSummarizeCommit } from "./gemini";
import { promise } from "zod";

export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
})

type Response = {
    commitHash: string
    commitMessage: string
    commitAuthorName: string
    commitAuthorAvatar: string
    commitDate: string
}

export const getCommitHashes = async (githubUrl: string): Promise<Response[]> => {
    
    const [owner, repo] = githubUrl.split('/').slice(-2);

    if (!owner || !repo) {
        throw new Error("Invalid GitHub URL. Ensure the URL is in the format: https://github.com/owner/repo");
    }
    const { data } = await octokit.rest.repos.listCommits({
        owner,
        repo
    }) 

    const sortedCommits = data.sort((a: any, b: any) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()) as any[]

    return sortedCommits.slice(0, 10).map((commit: any) => ({
        commitHash: commit.sha as string,
        commitMessage: commit.commit.message ?? "",
        commitAuthorName: commit.commit?.author.name ?? "",
        commitAuthorAvatar: commit?.author?.avatar_url ?? "",
        commitDate: commit.commit?.author?.date ?? "",
    }))
}


export const pollCommits = async (projectId: string) => {
    const { githubUrl } = await fetchProjectGithubUrl(projectId);
    const commitHashes = await getCommitHashes(githubUrl);
    const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes);

    console.log("Unprocessed commits:", unprocessedCommits);

    const summaryResponses = await Promise.allSettled(
        unprocessedCommits.map((commit) =>
            summarizeCommit(githubUrl, commit.commitHash)
        )
    );

    const summaries = summaryResponses.map((response) =>
        response.status === "fulfilled" ? response.value : ""
    );

    console.log("Summaries:", summaries);

    const commits = await db.commit.createMany({
        data: summaries.map((summary, index) => ({
            projectId,
            commitHash: unprocessedCommits[index]?.commitHash,
            commitMessage: unprocessedCommits[index]?.commitMessage,
            commitAuthorName: unprocessedCommits[index]?.commitAuthorName,
            commitAuthorAvatar: unprocessedCommits[index]?.commitAuthorAvatar,
            commitDate: unprocessedCommits[index]?.commitDate,
            summary,
        })),
    });

    return commits;
};



async function summarizeCommit(githubUrl: string, commitHash: string){
    const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
        headers: {
            Accept: 'application/vnd.github.v3.diff',
        },
    });
    return await aiSummarizeCommit(data) || ""
}


async function fetchProjectGithubUrl(projectId: string) {
    const project = await db.project.findUnique({
        where: {
            id: projectId
        }, select: {
            githubUrl: true
        }
    })

    if (!project?.githubUrl){
        throw new Error("Project not found")
    }

    return { project, githubUrl: project?.githubUrl }
}

async function filterUnprocessedCommits(projectId: string, commitHashes: Response[]) {
    const processedCommits = await db.commit.findMany({
        where: { projectId }
    })

    const unprocessedCommits = commitHashes.filter((commit) => !processedCommits.some((processedCommit) => processedCommit.commitHash === commit.commitHash))
    return unprocessedCommits
}