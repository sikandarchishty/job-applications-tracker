"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Job, JobStatus } from "@/lib/jobs";
import { jobStatuses } from "@/lib/jobs";
import { formatDate } from "@/lib/utils";
import {
    MapPin,
    Calendar,
    Briefcase,
    ExternalLink,
    MoreVertical,
    Building2,
    Phone,
    Sparkles,
} from "lucide-react";

const statusColors: Record<JobStatus, string> = {
    "Short listed": "bg-muted text-muted-foreground",
    Applied: "bg-muted text-muted-foreground",
    Interviewing: "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
    Offer: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100",
    Rejected: "bg-rose-100 text-rose-900 dark:bg-rose-900 dark:text-rose-100",
};

const statusIcons: Record<JobStatus, string> = {
    "Short listed": "📋", Applied: "📨",
    Interviewing: "💬",
    Offer: "🎉",
    Rejected: "❌",
};

type JobCardProps = {
    job: Job;
    onMove: (id: string, status: JobStatus) => void;
    onDelete: (id: string) => void;
};

// Design 1: Current (compact with dropdown)
export function JobCardCompact({ job, onMove, onDelete }: JobCardProps) {
    return (
        <Card className="flex h-full flex-col">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-foreground">{job.role}</p>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                </div>
                <Badge className={statusColors[job.status]} variant="secondary">
                    {job.status}
                </Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{job.workType} • {job.city}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(job.appliedDate)}</span>
                </div>
                {job.lastContacted && (
                    <div className="text-xs">
                        <span className="font-medium text-foreground">Last contacted:</span> {formatDate(job.lastContacted)}
                    </div>
                )}
                {job.notes && <p className="line-clamp-2 italic">{job.notes}</p>}
            </CardContent>
            <CardFooter className="mt-auto flex items-center justify-between gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Move to</DropdownMenuLabel>
                        {jobStatuses
                            .filter((status) => status !== job.status)
                            .map((status) => (
                                <DropdownMenuItem
                                    key={status}
                                    onClick={() => onMove(job.id, status)}
                                >
                                    {status}
                                </DropdownMenuItem>
                            ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(job.id)}>
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>
        </Card>
    );
}

// Design 2: Minimal with icon-based status
export function JobCardMinimal({ job, onMove, onDelete }: JobCardProps) {
    return (
        <Card className="flex h-full flex-col overflow-hidden">
            <div className={`h-1 ${statusColors[job.status].split(" ")[0]}`} />
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <p className="font-semibold leading-tight">{job.role}</p>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                    </div>
                    <span className="text-lg">{statusIcons[job.status]}</span>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 flex-1">
                <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{job.workType} • {job.city}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{job.appliedDate}</span>
                </div>
                {job.source && (
                    <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{job.source}</span>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex gap-2">
                {job.link && (
                    <a
                        href={job.link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1"
                    >
                        <Button size="sm" variant="outline" className="w-full gap-2">
                            <ExternalLink className="h-3 w-3" />
                            View
                        </Button>
                    </a>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Move to</DropdownMenuLabel>
                        {jobStatuses
                            .filter((status) => status !== job.status)
                            .map((status) => (
                                <DropdownMenuItem
                                    key={status}
                                    onClick={() => onMove(job.id, status)}
                                >
                                    {status}
                                </DropdownMenuItem>
                            ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(job.id)}>
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>
        </Card>
    );
}

// Design 3: Modern with status buttons
export function JobCardModern({ job, onMove, onDelete }: JobCardProps) {
    return (
        <Card className="flex h-full flex-col overflow-hidden border-l-4" style={{
            borderLeftColor: job.status === "Interviewing" ? "#3b82f6" :
                job.status === "Offer" ? "#10b981" :
                    job.status === "Rejected" ? "#ef4444" : "#d1d5db"
        }}>
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <p className="font-semibold">{job.role}</p>
                        <p className="text-sm font-medium text-muted-foreground">{job.company}</p>
                    </div>
                    <Badge
                        className={`${statusColors[job.status]} whitespace-nowrap`}
                        variant="secondary"
                    >
                        {job.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-2 flex-1">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {job.workType} • {job.city}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        Applied {formatDate(job.appliedDate)}
                    </div>
                </div>
                {job.notes && (
                    <div className="rounded-md bg-muted/50 p-2 text-xs leading-relaxed">
                        {job.notes}
                    </div>
                )}
                {job.contact && (
                    <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Contact:</span> {job.contact}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                            Move status
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {jobStatuses
                            .filter((status) => status !== job.status)
                            .map((status) => (
                                <DropdownMenuItem
                                    key={status}
                                    onClick={() => onMove(job.id, status)}
                                >
                                    {status}
                                </DropdownMenuItem>
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(job.id)}
                    className="text-destructive hover:text-destructive"
                >
                    Delete
                </Button>
            </CardFooter>
        </Card>
    );
}

// Design 4: Split layout with quick actions
export function JobCardSplit({ job, onMove, onDelete }: JobCardProps) {
    return (
        <Card className="flex h-full flex-col overflow-hidden">
            <div className="flex items-stretch">
                <div className={`w-1 ${statusColors[job.status].split(" ")[0]}`} />
                <div className="flex-1">
                    <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="text-sm font-semibold">{job.role}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Building2 className="h-3.5 w-3.5" />
                                    {job.company}
                                </div>
                            </div>
                            <Badge className={statusColors[job.status]} variant="secondary">
                                {job.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {job.workType} • {job.city}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            Applied {formatDate(job.appliedDate)}
                        </div>
                        {job.contact && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-3.5 w-3.5" />
                                {job.contact}
                            </div>
                        )}
                        {job.notes && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                                {job.notes}
                            </p>
                        )}
                    </CardContent>
                </div>
            </div>
            <CardFooter className="flex gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" className="w-full">
                            Move status
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {jobStatuses
                            .filter((status) => status !== job.status)
                            .map((status) => (
                                <DropdownMenuItem
                                    key={status}
                                    onClick={() => onMove(job.id, status)}
                                >
                                    {status}
                                </DropdownMenuItem>
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(job.id)}
                    className="text-destructive hover:text-destructive"
                >
                    Delete
                </Button>
            </CardFooter>
        </Card>
    );
}

// Design 5: Highlighted header with CTA
export function JobCardHighlight({ job, onMove, onDelete }: JobCardProps) {
    return (
        <Card className="flex h-full flex-col">
            <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                    <Badge className={statusColors[job.status]} variant="secondary">
                        {job.status}
                    </Badge>
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                    <p className="text-base font-semibold leading-tight">{job.role}</p>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {job.workType} • {job.city}
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Applied {formatDate(job.appliedDate)}
                </div>
                {job.source && (
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        {job.source}
                    </div>
                )}
                {job.notes && (
                    <div className="rounded-lg bg-muted/40 p-3 text-xs">
                        {job.notes}
                    </div>
                )}
            </CardContent>
            <CardFooter className="mt-auto flex gap-2">
                {job.link ? (
                    <a href={job.link} target="_blank" rel="noreferrer" className="flex-1">
                        <Button size="sm" className="w-full">
                            View posting
                        </Button>
                    </a>
                ) : (
                    <Button size="sm" variant="outline" className="flex-1">
                        Add link
                    </Button>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                            Actions
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Move to</DropdownMenuLabel>
                        {jobStatuses
                            .filter((status) => status !== job.status)
                            .map((status) => (
                                <DropdownMenuItem
                                    key={status}
                                    onClick={() => onMove(job.id, status)}
                                >
                                    {status}
                                </DropdownMenuItem>
                            ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(job.id)}>
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>
        </Card>
    );
}
