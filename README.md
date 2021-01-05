# FishBook

命令行看小说

## 安装
```
npm install -g fishbook
fishbook -h
```

## 导入小说

- 支持utf-8, gbk格式的txt文件
- 支持绝对路径与相对路径

```
fishbook add /path/filename.txt
```

## 选择小说
```
fishbook bookshelf           // 选择小说
fishbook bookshelf 小说名     // 切换到指定小说
```

## 选择章节
```
fishbook chapter         // 默认第一页
fishbook chapter 2    // 页数 Number
fishbook chapter end     // 最后一页 String

fishbook chapter -s 章节名 // 搜索目录 String
```

## 阅读
默认为选中的小说，可使用`fishbook bookshelf` 修改

可通过上下键翻页
```
fishbook read
```

## 删除小说
```
fishbook bookshelf -d            // 选择要删除的小说
fishbook bookshelf 小说名 -d   // 删除指定小说
```

## 设置

```
fishbook setting
```

- 阅读时是否单行 (默认为true)
- 阅读时显示字数
- 阅读时文字颜色 (16进制颜色, 可输入空)
- 阅读时自动翻页 (默认不翻页, 设置为0不翻页)

tips: 设置字数后，单行将为false


### License
[MIT](http://www.opensource.org/licenses/MIT)
