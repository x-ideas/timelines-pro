<script lang="ts">

  import { parseTagWithParentInfo } from 'src/apis/filter/parse-parent-children-tag';
  import { TagTreeData } from '../tag-tree/types';
  import TagTree from '../tag-tree/tag-tree.svelte'

  // export let tabs: string[];
  export let tags: string[] | undefined;

  export let names: string[] | undefined;

  // 标签个数统计
  export let tagCountMap: Map<string, number> = new Map<string, number>();
  // 名字个数统计
  export let nameCountMap: Map<string, number> = new Map<string, number>();

  export let onTagClick: (tag: string) => void;

  export let onNameClick: (name: string) => void;

  function makeTreeData(tagNames: string[], tagCounts: Map<string, number>): TagTreeData[] {
    // 根据/分割tag
    const tagTreeData: TagTreeData[] = [];

    const tagInfoMap: Record<string, TagTreeData> = {}

    for (const tagName of tagNames) {
      const count = tagCounts.get(tagName) ?? 0;

      const allTags = parseTagWithParentInfo(tagName);

      for(const {tag, parent} of allTags) {
        let info = tagInfoMap[tag];
        if (info) {
          info.count += count;
        } else {
          tagInfoMap[tag] = {
            count: count,
            name: tag,
            id: tag,
            parentId: parent,
            children: []
          }
        }
      }
    }


    // 生成树
    for (const tagInfo of Object.values(tagInfoMap)) {
      const {id, parentId, name, count} = tagInfo;
      const parentInfo = tagInfoMap[parentId ?? ''];
      const parent = parentInfo ? parentInfo : undefined;

      const tagTreeItem: TagTreeData = {
        id,
        parentId,
        name,
        count,
        children: []
      }

      if (parent) {
        parent.children.push(tagTreeItem);
      } else {
        tagTreeData.push(tagTreeItem);
      }
    }

    // 找到根节点
    return Object.values(tagInfoMap).filter(item => !item.parentId);
  }

  $: tagTreeData = makeTreeData(tags ?? [], tagCountMap);

</script>


  <div class='timeline-event-head'>EventTags</div>
  <TagTree roots={tagTreeData} />

  <hr class='mt-2 mb-2' />
  <div class='timeline-event-head'>EventNames</div>
  {#each (names??[]) as name}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div role="button" tabindex=-1 class="timeline-event-tag-wrapper text-gray-500" on:click={() => {
      onNameClick(name)
    }}><span class='tag'>{name}</span>
    <div class='ml-auto'>{nameCountMap.get(name) ?? 0}</div>
  </div>
  {/each}



<style lang='css'>
  .timeline-event-head {
    font-size: 16px;
  }

  .timeline-event-tag-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin: 4px;
  }
</style>
