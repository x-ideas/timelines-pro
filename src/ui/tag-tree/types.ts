export interface TagTreeData {
	id: string;
	parentId: string | undefined;
	name: string;
	count: number;
	children: TagTreeData[];
}
