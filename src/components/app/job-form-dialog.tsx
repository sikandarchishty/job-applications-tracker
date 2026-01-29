"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { JobInput, JobStatus } from "@/lib/jobs";
import { jobStatuses } from "@/lib/jobs";
import { Separator } from "../ui/separator";

const defaultJob: JobInput = {
    company: "",
    role: "",
    workType: "",
    city: "",
    status: "Short listed",
    appliedDate: new Date().toISOString().slice(0, 10),
    source: "",
    link: "",
    notes: "",
    contact: "",
};

type JobFormDialogProps = {
    onCreate?: (job: JobInput) => Promise<void> | void;
    onEdit?: (job: JobInput) => Promise<void> | void;
    disabled?: boolean;
    buttonClassName?: string;
    initialJob?: JobInput;
    trigger?: React.ReactNode;
};

export function JobFormDialog({
    onCreate,
    onEdit,
    disabled,
    buttonClassName,
    initialJob,
    trigger,
}: JobFormDialogProps) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<JobInput>(initialJob || defaultJob);
    const [isSaving, setIsSaving] = useState(false);
    const isEditMode = !!initialJob;

    // Reset form when initialJob changes or dialog opens
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (newOpen && initialJob) {
            // Editing: show database value
            setForm(initialJob);
        } else if (newOpen && !initialJob) {
            // Creating: use current date
            const today = new Date().toISOString().slice(0, 10);
            setForm({ ...defaultJob, appliedDate: today });
        } else if (!newOpen) {
            // Closing: reset form
            setForm(initialJob || defaultJob);
        }
    };

    const canSubmit = useMemo(() => {
        return form.company.trim() && form.role.trim() && form.workType.trim() && form.city?.trim();
    }, [form]);

    const hasChanges = useMemo(() => {
        if (!isEditMode || !initialJob) return true;

        return (
            form.company !== initialJob.company ||
            form.role !== initialJob.role ||
            form.workType !== initialJob.workType ||
            form.city !== initialJob.city ||
            form.status !== initialJob.status ||
            form.appliedDate !== initialJob.appliedDate ||
            (form.source || "") !== (initialJob.source || "") ||
            (form.link || "") !== (initialJob.link || "") ||
            (form.notes || "") !== (initialJob.notes || "") ||
            (form.contact || "") !== (initialJob.contact || "") ||
            (form.lastContacted || "") !== (initialJob.lastContacted || "")
        );
    }, [form, initialJob, isEditMode]);

    const handleChange = (field: keyof JobInput, value: string | JobStatus) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!canSubmit) return;

        setIsSaving(true);
        const payload = {
            ...form,
            company: form.company.trim(),
            role: form.role.trim(),
            workType: form.workType.trim(),
            city: form.city.trim(),
            source: form.source?.trim() || "",
            link: form.link?.trim() || "",
            notes: form.notes?.trim() || "",
            contact: form.contact?.trim() || "",
            lastContacted: form.lastContacted?.trim() || undefined,
        };

        try {
            if (isEditMode && onEdit) {
                // Check if there are actual changes before calling onEdit
                const hasChanges = !initialJob || JSON.stringify(payload) !== JSON.stringify(initialJob);
                if (hasChanges) {
                    await onEdit(payload);
                }
            } else if (onCreate) {
                await onCreate(payload);
            }
        } finally {
            setIsSaving(false);
            setOpen(false);
            setForm(initialJob || defaultJob);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button disabled={disabled} className={buttonClassName}>
                        Add job
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[90vw]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "Edit job" : "Add a job application"}</DialogTitle>
                    {/* <DialogDescription>
                        {isEditMode ? "Update the details for this job application." : "Keep your pipeline clean by capturing key details in one place."}
                    </DialogDescription> */}
                </DialogHeader>
                <Separator className="mb-4" />
                <form className="grid gap-4" onSubmit={handleSubmit}>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Row 1: Company and Role */}
                        <div className="grid gap-2">
                            <Label htmlFor="company">Company</Label>
                            <Input
                                id="company"
                                value={form.company}
                                onChange={(event) => handleChange("company", event.target.value)}
                                placeholder="Acme Inc."
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Input
                                id="role"
                                value={form.role}
                                onChange={(event) => handleChange("role", event.target.value)}
                                placeholder="Senior Frontend Engineer"
                            />
                        </div>

                        {/* Row 2: Type and City */}
                        <div className="grid gap-2">
                            <Label htmlFor="workType">Type</Label>
                            <Select
                                value={form.workType}
                                onValueChange={(value) => handleChange("workType", value)}
                            >
                                <SelectTrigger id="workType" className="w-full">
                                    <SelectValue placeholder="Select job type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Remote">Remote</SelectItem>
                                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                                    <SelectItem value="On-site">On-site</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                value={form.city}
                                onChange={(event) => handleChange("city", event.target.value)}
                                placeholder="Berlin"
                            />
                        </div>

                        {/* Row 3: Conditional based on mode */}
                        {isEditMode ? (
                            <>
                                {/* Edit mode: Applied date and Last Contacted */}
                                <div className="grid gap-2">
                                    <Label htmlFor="appliedDate">Applied date</Label>
                                    <Input
                                        id="appliedDate"
                                        type="date"
                                        value={form.appliedDate}
                                        onChange={(event) =>
                                            handleChange("appliedDate", event.target.value)
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="lastContacted">Last contacted</Label>
                                    <Input
                                        id="lastContacted"
                                        type="date"
                                        value={form.lastContacted}
                                        onChange={(event) =>
                                            handleChange("lastContacted", event.target.value)
                                        }
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Add mode: Source and Applied date */}
                                <div className="grid gap-2">
                                    <Label htmlFor="source">Source</Label>
                                    <Input
                                        id="source"
                                        value={form.source}
                                        onChange={(event) => handleChange("source", event.target.value)}
                                        placeholder="LinkedIn, referral, company site"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="appliedDate">Applied date</Label>
                                    <Input
                                        id="appliedDate"
                                        type="date"
                                        value={form.appliedDate}
                                        onChange={(event) =>
                                            handleChange("appliedDate", event.target.value)
                                        }
                                    />
                                </div>
                            </>
                        )}

                        {/* Row 4: Conditional based on mode */}
                        {isEditMode ? (
                            <>
                                {/* Edit mode: Contact and Status */}
                                <div className="grid gap-2">
                                    <Label htmlFor="contact">Contact</Label>
                                    <Input
                                        id="contact"
                                        value={form.contact}
                                        onChange={(event) => handleChange("contact", event.target.value)}
                                        placeholder="Recruiter name or email"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={form.status}
                                        onValueChange={(value) => handleChange("status", value)}
                                    >
                                        <SelectTrigger id="status" className="w-full">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {jobStatuses.map((status) => (
                                                <SelectItem key={status} value={status}>
                                                    {status}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Add mode: Contact (full width) */}
                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="contact">Contact</Label>
                                    <Input
                                        id="contact"
                                        value={form.contact}
                                        onChange={(event) => handleChange("contact", event.target.value)}
                                        placeholder="Recruiter name or email"
                                    />
                                </div>
                            </>
                        )}

                        {/* Row 5: Job Link (both modes) */}
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="link">Job link</Label>
                            <Input
                                id="link"
                                value={form.link}
                                onChange={(event) => handleChange("link", event.target.value)}
                                placeholder="https://"
                            />
                        </div>

                        {/* Row 6: Notes (both modes) */}
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={form.notes}
                                onChange={(event) => handleChange("notes", event.target.value)}
                                placeholder="Interview feedback, follow-ups, salary expectations..."
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button type="submit" disabled={!canSubmit || !hasChanges || isSaving}>
                            {isSaving ? "Saving..." : "Save job"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
