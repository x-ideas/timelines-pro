fork from [obsidian timeline](https://github.com/Darakah/obsidian-timelines)

另外新增了一些功能。

## Features

- 区分出时间的值和展示: 表现在区分`data-date`和`data-date-description`字段上。另外，如果是一段时间，也可以使用`data-date-start`和`data-date-end`。

  > data-date 和 data-date-start 都会被当作是开始时间。这在缺失对应的字段的情况下

- 增加`data-event-tags`字段，用于支持 tag 级别的过滤。

  > obsidian timeline 只支持文件级别的过滤

- tag 支持模糊匹配：可以使用`*`, `?`等通配符。

- tag 支持逻辑选择：比如可以对`eventTags`或者文件`tags`写出如下过滤条件`a || (b && !c)`，其中`a, b, c`都是标签

## Example

### 示例一: 文件维度：过滤文件标签

- 被搜索的文件
  > 对应的文件中，需要增加 {xxx} 的标签，这个例子中为 人物/苏轼

<span class='ob-timelines' data-date='1037/01/08' data-date-description="1037年1月8号" data-title="苏轼出生于眉山"></span>
<span class='ob-timelines' data-date='1101/08/24' data-date-description="1101年8月24号" data-title="苏轼病逝于常州"></span>
<span class='ob-timelines' data-date-description="1086—1093期间" data-date='1086/01/01' data-title="行香子·述怀"  data-event-tags='宋词'>

<div>清夜无尘，月色如银。酒斟时，须满十分。浮名浮利，劳苦虚神，叹隙中驹，石中火，梦中身。</div>
<div>虽抱文章，开口谁亲。且陶陶，乐尽天真。几时归去，做个闲人。对一张琴，一壶酒，一溪云。</div></span>

- timeline 报告所在的文件

```timeline-pro
tags=人物/苏轼
```

> 此时会展示上述三条记录

### 示例二: 事件维度：过滤 eventTags

- 被搜索的文件
  <span class='ob-timelines' data-date='1037/01/08' data-date-description="1037年1月8号" data-title="苏轼出生于眉山"></span>
  <span class='ob-timelines' data-date='1101/08/24' data-date-description="1101年8月24号" data-title="苏轼病逝于常州"></span>
  <span class='ob-timelines' data-date-description="1086—1093期间" data-date='1086/01/01' data-title="行香子·述怀"  data-event-tags='宋词'>

<div>清夜无尘，月色如银。酒斟时，须满十分。浮名浮利，劳苦虚神，叹隙中驹，石中火，梦中身。</div>
<div>虽抱文章，开口谁亲。且陶陶，乐尽天真。几时归去，做个闲人。对一张琴，一壶酒，一溪云。</div></span>

- timeline 报告所在的文件

```timeline-pro
eventTags=宋词
```

> 此时会展示上述 《行香子·述怀》这一条记录

### 示例三: 满足多个条件

```timeline-pro
tags=A;B
```

> 同时也适用于 eventTags

> 选中 A 和 B 标签都存在的文件

### 示例四： 满足多个条件

```timeline-pro
tags=A && B
```

> 同时也适用于 eventTags

### 示例五：满足或的条件

```timeline-pro
tags=A || B
```

> 同时也适用于 eventTags

### 示例六：非 条件

```timeline-pro
tags = !A
```

> 同时也适用于 eventTags

### 示例七： 复杂组合

```timeline-pro
tags = A || (B && !C)
```

> 同时也适用于 eventTags

## RoadMap

- 把时间当作一等公民，对时间做更细致的过滤。如，事件时间为 1934/02/04，那么默认支持按年，按月，按天等多种过滤条件的筛选。
