import api from "@/lib/axios";

export interface LeaderboardEntry {
    position: number;
    userId: string;
    fullName: string;
    avatarUrl: string | null;
    xp: number;
    points: number;
    level: number;
}

export interface BadgeItem {
    id: string;
    name: string;
    description: string | null;
    iconUrl: string | null;
    points: number;
    totalEarned: number;
}

export interface MyGamification {
    userId: string;
    xp: number;
    points: number;
    level: number;
    xpCurrentLevel: number;
    xpNextLevel: number;
    position: number | null;
    badges: {
        id: string;
        name: string;
        description: string | null;
        iconUrl: string | null;
        points: number;
        earnedAt: string;
    }[];
}

export async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    const { data } = await api.get("/api/gamification/leaderboard", { params: { limit } });
    return data.data ?? [];
}

export async function getBadges(): Promise<BadgeItem[]> {
    const { data } = await api.get("/api/gamification/badges");
    return data.data ?? [];
}

export async function getMyGamification(): Promise<MyGamification> {
    const { data } = await api.get("/api/gamification/me");
    return data.data;
}
