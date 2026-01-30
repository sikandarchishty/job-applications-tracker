"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "@/components/app/app-header";
import { JobCard } from "@/components/app/job-card";
import { JobFormDialog } from "@/components/app/job-form-dialog";
import { StatsBar } from "@/components/app/stats-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Models } from "appwrite";
import {
  appwriteConfig,
  createJob,
  deleteJob,
  getCurrentUser,
  getCurrentSession,
  fetchGoogleUserData,
  listJobs,
  signInWithGoogle,
  signOut,
  updateJob,
  updateUserAvatar,
} from "@/lib/appwrite";
import { jobStatuses, sampleJobs, type Job, type JobInput, type JobStatus } from "@/lib/jobs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Filter, LoaderCircle, PlusIcon } from "lucide-react";

const statusFilters = ["All", ...jobStatuses] as const;
type StatusFilter = (typeof statusFilters)[number];

const getLocalId = () =>
  globalThis.crypto?.randomUUID?.() ?? `job-${Date.now()}`;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message ?? fallback);
  }
  if (typeof error === "string") return error;
  return fallback;
};

export default function Home() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [jobs, setJobs] = useState<Job[]>(sampleJobs);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [workTypeFilter, setWorkTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingUser, setLoadingUser] = useState(true);

  const hasAppwrite = Boolean(appwriteConfig.endpoint && appwriteConfig.projectId);
  const hasDatabase = Boolean(
    appwriteConfig.databaseId && appwriteConfig.jobsCollectionId
  );
  const syncEnabled = Boolean(hasAppwrite && hasDatabase && user);

  useEffect(() => {
    let isMounted = true;
    getCurrentUser()
      .then((currentUser) => {
        if (isMounted) setUser(currentUser);
      })
      .finally(() => {
        if (isMounted) setLoadingUser(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!syncEnabled) return;

    listJobs()
      .then((data) => setJobs(data))
  }, [syncEnabled]);

  // Fetch and update user preferences with Google data after login
  useEffect(() => {
    if (!user || (user.prefs as Record<string, unknown>)?.avatar) return;

    const updatePreferences = async () => {
      try {
        const currentSession = await getCurrentSession();

        if (currentSession && currentSession.providerAccessToken) {
          const googleData = await fetchGoogleUserData(currentSession.providerAccessToken);

          if (googleData && googleData.picture) {
            const updatedUser = await updateUserAvatar(googleData.picture);
            if (updatedUser) {
              setUser(updatedUser);
            }
          }
        }
      } catch {
        // Silent fail
      }
    };

    updatePreferences();
  }, [user]);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    const statusOrder: Record<JobStatus, number> = {
      "Short listed": 1,
      "Interviewing": 2,
      "Offer": 3,
      "Applied": 4,
      "Rejected": 5,
    };

    const filtered = jobs.filter((job) => {
      const matchesQuery =
        !query ||
        [job.company, job.role, job.workType, job.notes]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(query));
      const matchesStatus =
        statusFilter === "All" || job.status === statusFilter;
      const matchesWorkType =
        workTypeFilter === "all" || job.workType === workTypeFilter;
      return matchesQuery && matchesStatus && matchesWorkType;
    });

    return filtered.sort((a, b) => {
      const orderA = statusOrder[a.status] || 999;
      const orderB = statusOrder[b.status] || 999;
      return orderA - orderB;
    });
  }, [jobs, search, statusFilter, workTypeFilter]);

  const JOBS_PER_PAGE = 20;
  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
    const endIndex = startIndex + JOBS_PER_PAGE;
    return filteredJobs.slice(startIndex, endIndex);
  }, [filteredJobs, currentPage]);

  const workTypes = useMemo(() => {
    return ["Remote", "Hybrid", "On-site"];
  }, []);

  const handleCreateJob = async (job: JobInput) => {
    if (syncEnabled) {
      try {
        const created = await createJob(job);
        setJobs((prev) => [created, ...prev]);
        toast.success(`Job application added: ${created.company}`);
        return;
      } catch (error) {
        toast.error(
          `Unable to create job in Appwrite. ${getErrorMessage(
            error,
            "Please check collection permissions and required fields."
          )}`
        );
        return;
      }
    }
    setJobs((prev) => [{ ...job, id: getLocalId() }, ...prev]);
    toast.success(`Job application added: ${job.company}`);
  };

  const handleStatusChange = async (id: string, status: JobStatus) => {
    if (syncEnabled) {
      try {
        const updated = await updateJob(id, { status, lastContacted: new Date().toISOString().slice(0, 10) });
        setJobs((prev) => prev.map((job) => (job.id === id ? updated : job)));
        toast.success(`Status updated to ${status}`);
        return;
      } catch {
        toast.error("Unable to update job in Appwrite.");
      }
    }

    setJobs((prev) =>
      prev.map((job) =>
        job.id === id
          ? { ...job, status, lastContacted: new Date().toISOString().slice(0, 10) }
          : job
      )
    );
    toast.success(`Status updated to ${status}`);
  };

  const handleEditJob = async (id: string, updates: JobInput) => {
    if (syncEnabled) {
      try {
        const updated = await updateJob(id, updates);
        setJobs((prev) => prev.map((job) => (job.id === id ? updated : job)));
        toast.success(`Job application updated: ${updated.company}`);
        return;
      } catch (error) {
        toast.error(
          `Unable to update job in Appwrite. ${getErrorMessage(
            error,
            "Please check that all required fields are filled."
          )}`
        );
      }
    }

    setJobs((prev) =>
      prev.map((job) =>
        job.id === id
          ? { ...job, ...updates }
          : job
      )
    );
    toast.success(`Job application updated: ${updates.company}`);
  };

  const handleDeleteJob = async (id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (syncEnabled) {
      try {
        await deleteJob(id);
        setJobs((prev) => prev.filter((job) => job.id !== id));
        toast.success(`Job application deleted: ${job?.company}`);
        return;
      } catch {
        toast.error("Unable to delete job from Appwrite.");
      }
    }
    setJobs((prev) => prev.filter((job) => job.id !== id));
    toast.success(`Job application deleted: ${job?.company}`);
  };

  const handleSignIn = () => {
    signInWithGoogle().catch(() =>
      toast.error("Google sign-in is not available yet.")
    );
  };

  const handleSignOut = () => {
    signOut().finally(() => setUser(null));
  };

  if (loadingUser) {
    return (
      <div className="flex flex-col gap-3 min-h-screen items-center justify-center px-4">
        <p className="text-sm text-muted-foreground"><LoaderCircle className="w-8 h-8 animate-spin" /></p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-lg rounded-3xl border border-border bg-background p-8 text-center">
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Job Applications Tracker
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Sign in to manage your job applications, track status updates, and more.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button onClick={handleSignIn} disabled={!hasAppwrite}>
              Sign in with Google
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader user={user} onSignIn={handleSignIn} onSignOut={handleSignOut} />
      <main className="mx-auto flex w-full max-w-6xl flex-col px-4 py-8 md:px-8">

        <StatsBar jobs={jobs} />

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="filters" className="border-none">
            <div className="flex items-center justify-end">
              <AccordionTrigger className="flex items-center gap-0 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm">
                  <Filter className="h-3.5 w-3.5" />
                  <span>Filters</span>
                </div>
              </AccordionTrigger>
            </div>
            <AccordionContent>
              <div className="rounded-2xl flex flex-col gap-4 border border-border bg-background px-4 py-5">
                <h2 className="text-lg font-semibold">Filter Jobs</h2>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
                    <Input
                      placeholder="Search by company, role, or notes"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className="w-full md:max-w-sm"
                    />
                    <Select
                      value={workTypeFilter}
                      onValueChange={(value) => setWorkTypeFilter(value)}
                    >
                      <SelectTrigger className="w-full md:w-50">
                        <SelectValue placeholder="Filter by work type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All work types</SelectItem>
                        {workTypes.map((workType) => (
                          <SelectItem key={workType} value={workType}>
                            {workType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex w-full items-center gap-2 lg:w-auto">
                    <Button variant="outline" className="w-full lg:w-auto" onClick={() => {
                      setSearch("");
                      setStatusFilter("All");
                      setWorkTypeFilter("all");
                    }}>
                      Reset filters
                    </Button>
                  </div>
                </div>
                <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                  <TabsList className="flex w-full flex-wrap">
                    {statusFilters.map((status) => (
                      <TabsTrigger key={status} value={status}>
                        {status}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </AccordionContent>
            {/* <div className="flex items-center justify-between px-5 pb-5">
              <div className="text-sm text-muted-foreground">
                {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"} found
                {totalPages > 1 && ` (page ${currentPage} of ${totalPages})`}
              </div>
            </div> */}
          </AccordionItem>
        </Accordion>
        {/* </div> */}

        {filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-12 text-center">
            <p className="text-sm text-muted-foreground">No jobs match your filters.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {paginatedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onStatusChange={handleStatusChange}
                  onEdit={handleEditJob}
                  onDelete={handleDeleteJob}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Add Job Button */}
      <div className="fixed bottom-10 right-6 md:bottom-6 md:right-6 z-50">
        <JobFormDialog
          onCreate={handleCreateJob}
          trigger={
            <div className="bg-card-foreground flex items-center justify-center h-16 w-16 rounded-full shadow-lg cursor-pointer" role="button">
              <PlusIcon className="w-10 h-10 text-background" />
            </div>
          }
        />
      </div>
    </div>
  );
}
