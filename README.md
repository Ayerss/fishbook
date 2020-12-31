# FishBook

命令行看小说

## 安装
```
npm install -g fishbook
fishbook -h
```

## 导入小说

- 必须为utf-8格式的txt文件
- 支持绝对路径与相对路径

fishbook add /path/filename.txt

## 选择小说
```
fishbook bookshelf           // 选择小说
fishbook bookshelf bookname  // 切换到指定小说
```

## 选择章节
```
fishbook chapter         // 默认第一页
fishbook chapter page    // 页数 Number
fishbook chapter end     // 最后一页 String

fishbook chapter -s name // 搜索目录 String
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
fishbook bookshelf bookname -d   // 删除指定小说
```

## 设置

```
fishbook setting
```

- 阅读时是否单行 (默认为true)
- 阅读时显示字数

tips: 设置字数后，单行将为false


### License
[MIT](http://www.opensource.org/licenses/MIT)
