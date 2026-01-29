"use client";

import type { Job } from "@/lib/jobs";
import { Card, CardContent } from "@/components/ui/card";

type StatsBarProps = {
    jobs: Job[];
};

export function StatsBar({ jobs }: StatsBarProps) {
    const total = jobs.length;
    const interviewing = jobs.filter((job) => job.status === "Interviewing").length;
    const applied = jobs.filter((job) => job.status === "Applied").length;
    const offers = jobs.filter((job) => job.status === "Offer").length;
    const rejected = jobs.filter((job) => job.status === "Rejected").length;
    // const responseRate = total === 0 ? 0 : ((interviewing + offers) / total) * 100;

    const stats = [
        { label: "Total applications", value: total, bgColor: "bg-muted", textColor: "text-foreground" },
        { label: "Applied", value: applied, bgColor: "bg-violet-100", textColor: "text-violet-900" },
        { label: "Interviewing", value: interviewing, bgColor: "bg-blue-100", textColor: "text-blue-900" },
        { label: "Offers", value: offers, bgColor: "bg-emerald-100", textColor: "text-emerald-900" },
        { label: "Rejections", value: rejected, bgColor: "bg-rose-100", textColor: "text-rose-900" },
        // { label: "Response rate", value: formatPercent(responseRate) },
    ];

    return (
        <div className="w-full overflow-x-auto">
            <div className="flex gap-3 min-w-max h-[100px]">
                {stats.map((stat) => (
                    <Card key={stat.label} className={`flex-1 min-w-40 sm:max-w-40 md:max-w-full border-0 ${stat.bgColor}`}>
                        <CardContent className="flex h-full flex-col gap-1 p-4 justify-center">
                            <span className={`text-sm ${stat.textColor} font-medium opacity-85`}>
                                {stat.label}
                            </span>
                            <span className={`text-2xl ml-auto font-semibold ${stat.textColor}`}>{stat.value}</span>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
