export const jobStatuses = [
    "Short listed",
    "Applied",
    "Interviewing",
    "Offer",
    "Rejected",
] as const;

export type JobStatus = (typeof jobStatuses)[number];

export type Job = {
    id: string;
    company: string;
    role: string;
    workType: string;
    city: string;
    status: JobStatus;
    appliedDate: string;
    source?: string;
    link?: string;
    notes?: string;
    contact?: string;
    lastContacted?: string; // Last contacted date
};

export type JobInput = Omit<Job, "id">;

export const sampleJobs: Job[] = [
    {
        id: "job-001",
        company: "Northwind Labs",
        role: "Frontend Engineer",
        workType: "Remote",
        city: "Remote",
        status: "Interviewing",
        appliedDate: "2026-01-04",
        source: "Referral",
        link: "https://example.com/jobs/frontend-engineer",
        notes: "Panel interview scheduled for Feb 2.",
        contact: "maria.hunt@northwind.dev",
        lastContacted: "2026-01-22",
    },
    {
        id: "job-002",
        company: "Aurora Health",
        role: "Full Stack Developer",
        workType: "Hybrid",
        city: "Austin",
        status: "Applied",
        appliedDate: "2026-01-12",
        source: "LinkedIn",
        notes: "Follow up after 10 business days.",
        lastContacted: "2026-01-18",
    },
    {
        id: "job-003",
        company: "Crescent Ventures",
        role: "Product Engineer",
        workType: "On-site",
        city: "New York",
        status: "Offer",
        appliedDate: "2025-12-18",
        source: "Company site",
        link: "https://crescent.vc/careers",
        notes: "Offer received. Negotiating start date.",
        contact: "recruiting@crescent.vc",
        lastContacted: "2026-01-20",
    },
    {
        id: "job-004",
        company: "Nimbus AI",
        role: "UI Engineer",
        workType: "On-site",
        city: "San Francisco",
        status: "Rejected",
        appliedDate: "2025-12-30",
        source: "AngelList",
        notes: "Rejected after take-home exercise.",
        lastContacted: "2026-01-10",
    },
];
