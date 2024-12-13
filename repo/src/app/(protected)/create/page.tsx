'use client'
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react"
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";


type FormInput = {
    repoUrl: string,
    projectName: string,
    githubToken?: string
}

const CreatePage = () => {
    const { register, handleSubmit, reset } = useForm<FormInput>()
    const createProject = api.project.createProject.useMutation()

    const refetch = useRefetch()

    function onSubmit(data: FormInput){
        createProject.mutate({
            githuburl: data.repoUrl,
            name: data.projectName,
            githubToken: data.githubToken
        }, {
            onSuccess: () => {
                toast.success('Project created successfully')
                refetch()
                reset()
            },
            onError: () => {
                toast.error('Failed to create project')
            }
        })
        return true
    }

    return (
        <div className="flex items-center gap-12 h-full justify-center">
            <img src="undraw.svg" alt="project-assistant" className="h-56 w-auto" />
            <div>
                <div>
                    <h1 className="font-semibold text-2xl">
                        Link your GitHub Repository
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter the URL of the repository to link with Repo Insights
                    </p>
                    <div className="h-4"></div>
                    <div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Input 
                                {...register('projectName', {required: true})}
                                placeholder="Project Name"
                            />
                            <div className="h-2"></div>
                            <Input 
                                {...register('repoUrl', {required: true})}
                                placeholder="GitHub Url"
                            />
                            <div className="h-2"></div>
                            <Input 
                                {...register('githubToken')}
                                placeholder="Github Token (Optional)"
                            />
                            <div className="h-4"></div>
                            <Button type="submit" disabled={createProject.isPending}>
                                Create Project
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreatePage