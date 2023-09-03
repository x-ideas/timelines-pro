<script lang="ts">

  import { parseTagWithParentInfo } from 'src/apis/filter/parse-parent-children-tag';
  import { TagTreeData } from '../tag-tree/types';
  import TagTree from '../tag-tree/tag-tree.svelte'
  import TagZone from '../tag-hander/tag-handler.svelte'

  // export let tabs: string[];
  export let tags: string[] | undefined;

  export let names: string[] | undefined;

  // 标签个数统计
  export let tagCountMap: Map<string, number> = new Map<string, number>();
  // 名字个数统计
  export let nameCountMap: Map<string, number> = new Map<string, number>();

  export let onTagClick: (tag: string) => void;

  export let onNameClick: (name: string) => void;


  let innerTags = tags;
  $: {
    innerTags = tags;
  }

  function makeTreeData(tagNames: string[], tagCounts: Map<string, number>): TagTreeData[] {
    // 根据/分割tag
    const tagTreeData: TagTreeData[] = [];

    const tagInfoMap: Record<string, TagTreeData> = {}

    for (const tagName of tagNames) {
      const count = tagCounts.get(tagName) ?? 0;

      const allTags = parseTagWithParentInfo(tagName);
      for(const {tag, parent, fullTag} of allTags) {
        let info = tagInfoMap[fullTag];
        if (info) {
          info.count += count;
        } else {
          tagInfoMap[fullTag] = {
            count: count,
            name: tag,
            id: tag,
            fullName: fullTag,
            parentId: parent,
            children: []
          }
        }
      }
    }

    // 生成树(支持多层级)
    for (const tagInfo of Object.values(tagInfoMap)) {
      const { parentId } = tagInfo;
      const parentInfo = tagInfoMap[parentId ?? ''] ?? undefined;

      if (parentInfo) {
        parentInfo.children.push(tagInfo);
      } else {
        tagTreeData.push(tagInfo);
      }
    }

    // 找到根节点
    return Object.values(tagInfoMap).filter(item => !item.parentId);
  }

  $: tagTreeData = makeTreeData(innerTags ?? [], tagCountMap);


  function sortA2Z() {
    innerTags = innerTags?.sort((a, b) => {
      return a.localeCompare(b);
    })
  }

  function sortZ2A() {
    innerTags = innerTags?.sort((a, b) => {
      return b.localeCompare(a);
    })
  }

  function sortCountHigh2Low() {

    function sort(a: TagTreeData, b: TagTreeData) {
      const aCount = a.count;
      const bCount = b.count;

      a.children.sort(sort);
      b.children.sort(sort);

      return bCount - aCount;
    }

    // 根据层级排序
    tagTreeData = tagTreeData.sort(sort);
  }

  function sortCountLow2High() {
    function sort(a: TagTreeData, b: TagTreeData) {
      const aCount = a.count;
      const bCount = b.count;

      a.children.sort(sort);
      b.children.sort(sort);

      return aCount - bCount;
    }

    // 根据层级排序
    tagTreeData = tagTreeData.sort(sort);
  }

</script>


  <TagZone title={'EventTags'} sortA2Z={sortA2Z} sortZ2A={sortZ2A} sortCountHigh2Low={sortCountHigh2Low} sortCountLow2High={sortCountLow2High}></TagZone>
  <div class='timeline-event-head'></div>
  <TagTree roots={tagTreeData} onClick={(node) => {
    onTagClick(node.fullName)
  }}/>

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


  .timeline-event-tag-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin: 4px;
  }
</style>
