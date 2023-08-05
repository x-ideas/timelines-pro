export interface TimelinesSettings {
	/** 标签 */
	timelineTag: string;
	/**  */
	sortDirection: boolean;
	/** 用来选中没有eventTags的tag，默认为none */
	noTag?: string;
}
