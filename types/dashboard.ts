export interface Bookmark {
  id: string;
  title: string;
  url: string;
  domain: string;
  favicon?: string;
  description?: string;
  createdAt: string;
  groupId: string;
}

export interface Group {
  id: string;
  name: string;
  color?: string;
}

export interface DashboardState {
  groups: Group[];
  bookmarksByGroup: Record<string, Bookmark[]>;
}
