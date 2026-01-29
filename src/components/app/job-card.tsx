"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import type { Job, JobInput, JobStatus } from "@/lib/jobs";
import { jobStatuses } from "@/lib/jobs";
import { formatDate } from "@/lib/utils";
import { Edit2, ExternalLink, MoreHorizontal } from "lucide-react";
import { JobFormDialog } from "./job-form-dialog";

const statusColors: Record<JobStatus, string> = {
    "Short listed": "bg-muted text-muted-foreground",
    Applied: "bg-violet-100 text-violet-900",
    Interviewing: "bg-blue-100 text-blue-900",
    Offer: "bg-emerald-100 text-emerald-900",
    Rejected: "bg-rose-100 text-rose-900",
};

const statusColorsText: Record<JobStatus, string> = {
    "Short listed": "text-muted-foreground",
    Applied: "text-violet-900",
    Interviewing: "text-blue-900",
    Offer: "text-emerald-900",
    Rejected: "text-rose-900",
};

const statusBorderShadow: Record<JobStatus, string> = {
    "Short listed": "border-border shadow-sm",
    Applied: "border-violet-200 shadow-violet-100",
    Interviewing: "border-blue-200 shadow-blue-100",
    Offer: "border-emerald-200 shadow-emerald-100",
    Rejected: "border-rose-200 shadow-rose-100",
};

type JobCardProps = {
    job: Job;
    onStatusChange: (id: string, status: JobStatus) => void;
    onEdit: (id: string, updates: JobInput) => void;
    onDelete: (id: string) => void;
};

export function JobCard({ job, onStatusChange, onEdit, onDelete }: JobCardProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    return (
        <Card className={`flex h-full flex-col shadow-md ${statusBorderShadow[job.status]}`}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                    <p className="font-semibold text-foreground">{job.role}</p>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                </div>
                <div className="border rounded-lg flex items-center overflow-hidden">
                    <p className={`${statusColors[job.status]} self-stretch flex items-center p-2 text-xs font-semibold`}>
                        {job.status}
                    </p>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-none">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {jobStatuses.map((status) => (
                                <DropdownMenuItem
                                    key={status}
                                    onClick={() => onStatusChange(job.id, status)}
                                    className={`${status === job.status ? "bg-accent" : ""} text-xs font-semibold`}
                                >
                                    <span className={`text-xs ${statusColorsText[status]}`}>{status}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="flex self-start flex-wrap gap-x-12 gap-y-5 text-sm text-muted-foreground">
                <InfoBlock label="City" value={job.city} />
                <InfoBlock label="Type" value={job.workType} />
                <InfoBlock label="Applied" value={formatDate(job.appliedDate)} />
                <InfoBlock label="Last contacted" value={formatDate(job.lastContacted)} />
                {job.contact ? <InfoBlock label="Contact" value={job.contact} /> : null}
                {job.source ? <InfoBlock label="Source" value={job.source} /> : null}
                {/* {job.source ? <InfoBlock label="Notes" value={job.notes} /> : null} */}
            </CardContent>
            {job.notes ? <div className="px-6"><InfoBlock label="Notes" value={job.notes} /></div> : null}


            <CardFooter className="mt-auto flex items-center justify-between gap-2">
                {job.link ? (
                    <Button asChild size="xs" className="gap-2">
                        <a href={job.link} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            Link to job
                        </a>
                    </Button>
                ) : (
                    <span aria-hidden className="flex-1" />
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2">
                            <Edit2 className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <JobFormDialog
                            initialJob={job}
                            onEdit={(updates) => onEdit(job.id, updates)}
                            trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit job</DropdownMenuItem>}
                        />
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-destructive">
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete job application</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this job application? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                onDelete(job.id);
                                setDeleteDialogOpen(false);
                            }}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}


function InfoBlock({ label, value }: { label: string; value: string | undefined }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium text-foreground">{value}</p>
        </div>
    );
}