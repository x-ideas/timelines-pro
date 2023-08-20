export interface TagTreeData {
	id: string;
	parentId: string | undefined;
	name: string;
	/**
	 * 考虑了层级结构，用于搜索
	 */
	fullName: string;
	count: number;
	children: TagTreeData[];
}
