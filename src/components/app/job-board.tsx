"use client";

import type { Job, JobInput, JobStatus } from "@/lib/jobs";
import { jobStatuses } from "@/lib/jobs";
import { JobCard } from "@/components/app/job-card";

const statusSummary: Record<JobStatus, string> = {
    "Short listed": "Jobs you're interested in.",
    Applied: "New applications waiting for a response.",
    Interviewing: "Active conversations and interview loops.",
    Offer: "Offers you can negotiate and decide on.",
    Rejected: "Closed opportunities for reference.",
};

type JobBoardProps = {
    jobs: Job[];
    onStatusChange: (id: string, status: JobStatus) => void;
    onEdit: (id: string, updates: JobInput) => void;
    onDelete: (id: string) => void;
};

export function JobBoard({ jobs, onStatusChange, onEdit, onDelete }: JobBoardProps) {
    return (
        <div className="grid gap-4 xl:grid-cols-4">
            {jobStatuses.map((status) => {
                const statusJobs = jobs.filter((job) => job.status === status);
                return (
                    <section
                        key={status}
                        className="flex flex-col gap-3 rounded-2xl border border-border bg-card/30 p-4"
                    >
                        <div>
                            <h3 className="text-base font-semibold">{status}</h3>
                            <p className="text-xs text-muted-foreground">{statusSummary[status]}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            {statusJobs.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
                                    No jobs in this stage yet.
                                </div>
                            ) : (
                                statusJobs.map((job) => (
                                    <JobCard
                                        key={job.id}
                                        job={job}
                                        onStatusChange={onStatusChange}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                    />
                                ))
                            )}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
