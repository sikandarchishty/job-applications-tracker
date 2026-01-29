import {
    Account,
    Client,
    Databases,
    ID,
    OAuthProvider,
    Permission,
    Query,
    Role,
} from "appwrite";
import type { Job, JobInput } from "@/lib/jobs";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const jobsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID;

let client: Client | null = null;
let account: Account | null = null;
let databases: Databases | null = null;

export const appwriteConfig = {
    endpoint,
    projectId,
    databaseId,
    jobsCollectionId,
};

export function getAppwrite() {
    if (!endpoint || !projectId) {
        return null;
    }

    if (!client) {
        client = new Client().setEndpoint(endpoint).setProject(projectId);
        account = new Account(client);
        databases = new Databases(client);
    }

    return {
        client,
        account: account as Account,
        databases: databases as Databases,
        databaseId,
        jobsCollectionId,
    };
}

export async function getCurrentUser() {
    const appwrite = getAppwrite();
    if (!appwrite) return null;
    try {
        return await appwrite.account.get();
    } catch {
        return null;
    }
}

export async function getCurrentSession() {
    const appwrite = getAppwrite();
    if (!appwrite) return null;
    try {
        return await appwrite.account.getSession("current");
    } catch {
        return null;
    }
}

export async function fetchGoogleUserData(accessToken: string) {
    try {
        const response = await fetch(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch Google user data");
        }

        const data = await response.json();
        return {
            name: data.name,
            email: data.email,
            picture: data.picture,
        };
    } catch (error) {
        console.error("Error fetching Google user data:", error);
        return null;
    }
}

export async function signInWithGoogle() {
    const appwrite = getAppwrite();
    if (!appwrite) {
        throw new Error("Appwrite is not configured.");
    }
    if (typeof window === "undefined") {
        throw new Error("OAuth is only available in the browser.");
    }
    const origin = window.location.origin;
    return appwrite.account.createOAuth2Session(
        OAuthProvider.Google,
        origin,
        origin
    );
}

export async function updateUserAvatar(avatarUrl: string) {
    const appwrite = getAppwrite();
    if (!appwrite) return null;
    try {
        const user = await appwrite.account.get();
        const prefs = user.prefs || {};

        const updatedPrefs = {
            ...prefs,
            avatar: avatarUrl,
        };

        await appwrite.account.updatePrefs(updatedPrefs);
        return await appwrite.account.get();
    } catch (error) {
        return null;
    }
}

export async function signOut() {
    const appwrite = getAppwrite();
    if (!appwrite) return;
    try {
        await appwrite.account.deleteSession("current");
    } catch {
        return;
    }
}

function ensureDatabase() {
    const appwrite = getAppwrite();
    if (!appwrite || !appwrite.databaseId || !appwrite.jobsCollectionId) {
        throw new Error("Missing Appwrite database configuration.");
    }

    return {
        ...appwrite,
        databaseId: appwrite.databaseId,
        jobsCollectionId: appwrite.jobsCollectionId,
    };
}

async function getUserPermissions() {
    const appwrite = getAppwrite();
    if (!appwrite) return undefined;
    try {
        const user = await appwrite.account.get();
        return [
            Permission.read(Role.user(user.$id)),
            Permission.update(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id)),
        ];
    } catch {
        return undefined;
    }
}

function toAppwritePayload(input: JobInput) {
    const { lastContacted, ...rest } = input;
    return rest;
}

export async function listJobs(): Promise<Job[]> {
    const appwrite = ensureDatabase();
    const response = await appwrite.databases.listDocuments(
        appwrite.databaseId,
        appwrite.jobsCollectionId,
        [Query.orderDesc("$createdAt")]
    );

    return response.documents.map((doc) => ({
        id: doc.$id,
        company: doc.company,
        role: doc.role,
        workType: doc.workType,
        city: doc.city,
        status: doc.status,
        appliedDate: doc.appliedDate,
        source: doc.source ?? undefined,
        link: doc.link ?? undefined,
        notes: doc.notes ?? undefined,
        contact: doc.contact ?? undefined,
        lastContacted: doc.lastContacted ?? undefined,
    })) as Job[];
}

export async function createJob(input: JobInput): Promise<Job> {
    const appwrite = ensureDatabase();
    const permissions = await getUserPermissions();
    const response = await appwrite.databases.createDocument(
        appwrite.databaseId,
        appwrite.jobsCollectionId,
        ID.unique(),
        toAppwritePayload(input),
        permissions
    );

    return {
        id: response.$id,
        company: response.company,
        role: response.role,
        workType: response.workType,
        city: response.city,
        status: response.status,
        appliedDate: response.appliedDate,
        source: response.source ?? undefined,
        link: response.link ?? undefined,
        notes: response.notes ?? undefined,
        contact: response.contact ?? undefined,
        lastUpdate: response.lastUpdate ?? undefined,
    } as Job;
}

export async function updateJob(
    id: string,
    updates: Partial<JobInput>
): Promise<Job> {
    const appwrite = ensureDatabase();
    // Remove id, undefined values, and lastContacted
    const { id: _, lastContacted, ...rest } = updates as any;
    const payload = Object.fromEntries(
        Object.entries(rest).filter(([, value]) => value !== undefined)
    );

    const response = await appwrite.databases.updateDocument(
        appwrite.databaseId,
        appwrite.jobsCollectionId,
        id,
        payload
    );

    return {
        id: response.$id,
        company: response.company,
        role: response.role,
        workType: response.workType,
        city: response.city,
        status: response.status,
        appliedDate: response.appliedDate,
        source: response.source ?? undefined,
        link: response.link ?? undefined,
        notes: response.notes ?? undefined,
        contact: response.contact ?? undefined,
        lastUpdate: response.lastUpdate ?? undefined,
    } as Job;
}

export async function deleteJob(id: string) {
    const appwrite = ensureDatabase();
    await appwrite.databases.deleteDocument(
        appwrite.databaseId,
        appwrite.jobsCollectionId,
        id
    );
}
