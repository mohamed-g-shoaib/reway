export interface Bookmark {
  id: string;
  title: string;
  domain: string;
  favicon?: string;
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
