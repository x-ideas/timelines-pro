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

## RoadMap

- 把时间当作一等公民，对时间做更细致的过滤。如，事件时间为 1934/02/04，那么默认支持按年，按月，按天等多种过滤条件的筛选。
