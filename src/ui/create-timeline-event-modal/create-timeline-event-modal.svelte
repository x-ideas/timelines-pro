<script lang="ts">
  import moment from "moment";
  import { Notice } from "obsidian";
  import { type ITimelineEventItemSource, getTimelineEventMomentTime } from "../../type";

    export let onOk: (newName: ITimelineEventItemSource) => void | undefined;
    export let onCancel: () => void | undefined;
    // @ts-ignore
    let info: ITimelineEventItemSource = {
      date: moment().format('YYYY/MM/DD'),
      dateDescription: moment().format('YYYY-MM-DD'),
      class: '',
      eventTags: '',
      value: '0',
      content: '',
      milestone: '',
      dateEnd: '',
      title: '',
      name: '',
      timeCost: '0'
    }
</script>



<div class='flex'>
  <div>名字</div>
  <input placeholder="用于区分一类事物的，跟npm package name类似" value={info.name} on:change={(event) => {
    info.name = event.currentTarget.value;
  }} />
</div>
<div class='flex'>
  <div>时间</div>
  <div>
    <input value={info.date} placeholder="YYYY/[MM]/[DD]/[hh]" on:change={(event) => {
      info.date = event.currentTarget.value;

      // 如果没有填写时间描述，自动填写
      if (!info.dateDescription) {
        const date = getTimelineEventMomentTime(info.date);
        if (date) {
          info.dateDescription = date.format('YYYY-MM-DD');
        }
      }
    }} />
  </div>
</div>
<div class='flex'>
  <div>时间描述</div>
  <input value={info.dateDescription} on:change={(event) => {
    info.dateDescription = event.currentTarget.value;
  }} />
</div>
<div class='title'>
  <div>事件标题</div>
  <input value={info.title} on:change={(event) => {
    info.title = event.currentTarget.value;
  }} />
</div>
<div class='flex'>
  <div>事件value</div>
  <input value={info.value} type='number' on:change={(event) => {
    info.value = event.currentTarget.value;
  }} />
</div>
<div class='flex'>
  <div>时间花费</div>
  <input value={info.timeCost} type='number' on:change={(event) => {
    info.timeCost = event.currentTarget.value;
  }} />
</div>


<div class='flex'>
  <div>事件标签</div>
  <input value={info.eventTags} placeholder=";分隔" on:change={(event) => {
    info.eventTags = event.currentTarget.value;
  }} />
</div>

<div class='flex'>
  <div>详细描述</div>
  <textarea value={info.content} on:change={(event) => {
    info.content = event.currentTarget.value;
  }} />
</div>

<div class='flex'>
  <div>结束时间</div>
  <div>
    <input value={info.dateEnd} placeholder="YYYY-MM-DD" on:change={(event) => {
      info.dateEnd = event.currentTarget.value;
    }} />
  </div>
</div>

<div class='flex'>
  <div>里程碑</div>
  <select on:change={(event) => {
    info.milestone = event.currentTarget.value;
  }}>
    <option value="false">否</option>
    <option value="true">是</option>
  </select>
</div>

<div class='flex'>
  <div>className</div>
  <input value={info.class} on:change={(event) => {
    info.class = event.currentTarget.value;
  }} />
</div>

<div>
  <button on:click={() => {
    // 校验是否合法
    // if (!info.name) {
    //   new Notice('名字不能为空');
    //   return;
    // }

    if (!info.date) {
      new Notice('时间不能为空');
      return;
    }

    // 时间是否有效
   const date =  getTimelineEventMomentTime(info.date);
   if (!date) {
      new Notice('时间无效');
      return;
   }

   if (!info.dateDescription) {
    new Notice('请输入时间描述')
    return;
   }

   // 结束时间
   if (info.dateEnd) {
      const dateEnd = getTimelineEventMomentTime(info.dateEnd);
      if (!dateEnd) {
        new Notice('结束时间无效');
        return;
      }
   }

   if (!info.value) {
     // 是否可以转换成数字
      const value = Number(info.value);
      if (isNaN(value)) {
        new Notice('value无效');
        return;
      }
   }

    onOk({
      ...info
    });

  }}>确定</button>
  <button on:click={onCancel}>取消</button>
</div>

<style lang="css">

</style>
