export interface TableColumn {
    title: string;
    iconUrl: string;
    canBeSorted: boolean;
    direction?: 'asc' | 'desc';
    key: string;
}